import {
  createAction,
  createAsyncThunk,
  createListenerMiddleware,
  createSlice,
  isAnyOf,
} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Edge, Node } from "@xyflow/react";
import { GOAL_NODE_ID } from "../../metadata/graph";
import type { RootState } from "../../store";
import {
  addAssumption,
  addVariables,
  applyTactic,
  fixLayout,
  loadProblem,
  removeEdge,
  resetProof,
  setAssumptions,
  setEdges,
  setGoal,
  setNodes,
  setVariables,
} from "../proof/proofSlice";
import { VISUAL_EDIT_MODE, setEditMode } from "../ui/uiSlice";
import { loadAndRunPyodide } from "./loader";

type Graph = {
  nodes: { id: string; label: string; tactic: string; sorry_free: boolean }[];
  edges: { source: string; target: string; label: string }[];
  proof_complete: boolean;
};

let customPyodide: {
  runPythonAsync: (
    code: string,
    { serializeToGraph }: { serializeToGraph: boolean },
  ) => Promise<{
    error?: string;
    result?: unknown;
    stdResults?: string[];
    output?: Graph;
    proofComplete?: boolean;
  }>;
  stdResults?: string[];
} | null = null;

let stdResults: string[] = [];

export const loadCustomPyodide = createAsyncThunk(
  "pyodide/loadCustomPyodide",
  async (_, { dispatch }) => {
    const pyodide = await loadAndRunPyodide({
      stdout: (line) => stdResults.push(line),
    });
    if (!pyodide) {
      return null;
    }

    customPyodide = {
      runPythonAsync: async (code: string) => {
        stdResults = [];
        let result: unknown;
        const codePrefix = code.split("\n").slice(0, -1).join("\n");
        const codeSuffix = code.split("\n").pop();
        const augmentedCode = `
_id_map = {}
_counter = 0
_nodes = []
_edges = []
output = {}
def traverse(node):
    global _counter
    if node not in _id_map:
        node_id = f"n{_counter}"
        _id_map[node] = node_id
        label = str(node.proof_state)
        _nodes.append(dict(id=node_id, label=label, tactic=str(node.tactic) or "", sorry_free=node.is_sorry_free()))
        _counter += 1
    for child in node.children:
        traverse(child)
        parent_id = _id_map[node]
        child_id = _id_map[child]
        tactic_label = str(node.tactic) or ""
        _edges.append(dict(source=parent_id, target=child_id, label=tactic_label))
${codePrefix}
out = ${codeSuffix?.trim() ? codeSuffix : "None"}
traverse(p.proof_tree)
graph=dict(nodes=_nodes, edges=_edges, proof_complete=p.proof_tree.is_sorry_free())
out
`.trim();
        try {
          result = await pyodide.runPythonAsync(augmentedCode);
        } catch (error) {
          return { error: `${error}` };
        }
        let graph: {
          toJs: ({
            dict_converter,
          }: { dict_converter: typeof Object.fromEntries }) => Graph;
        };
        try {
          graph = pyodide.globals.get("graph");
        } catch (error) {
          return { error: `${error}` };
        }
        let pyodideOutput: Graph;
        try {
          pyodideOutput = graph.toJs({ dict_converter: Object.fromEntries });
        } catch (error) {
          return { error: `${error}` };
        }
        dispatch(fixLayout());
        return {
          result,
          stdResults,
          output: pyodideOutput,
          proofComplete: pyodideOutput.proof_complete,
        };
      },
      stdResults,
    };
    return !!customPyodide;
  },
);

export const runProofCode = createAsyncThunk(
  "pyodide/runProof",
  async (code: string, { getState }) => {
    const state = getState() as RootState;
    const { editMode } = state.ui;

    if (!customPyodide) {
      return;
    }

    try {
      const result = await customPyodide.runPythonAsync(code, {
        serializeToGraph: false,
      });
      return { result, error: null, editMode };
    } catch (error) {
      let errorMessage: string;
      if (error instanceof Error) {
        if (error.message.includes("PythonError")) {
          errorMessage = `Python Error: ${error.message.replace("PythonError: ", "")}`;
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      } else {
        errorMessage = "An unexpected error occurred";
      }
      return { result: null, error: errorMessage, editMode };
    }
  },
);

export const convertProofGraphToCode = createAsyncThunk(
  "pyodide/convertProofGraphToCode",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const { edges, variables, assumptions, goal, nodes } = state.proof;

    const codeLines = [
      `# generated ${new Date().toLocaleString()}`,
      "from estimates.main import *",
      "from sympy import *",
      "p = ProofAssistant();",
    ];
    for (const variable of variables) {
      if (!variable.name) {
        continue;
      }
      codeLines.push(
        `${variable.name} = p.var("${variable.type}", "${variable.name}");`,
      );
    }
    for (const assumption of assumptions) {
      if (!assumption.input) {
        continue;
      }
      codeLines.push(`p.assume(${assumption.input}, "${assumption.name}");`);
    }

    if (goal.input) {
      codeLines.push(`p.begin_proof(${goal.input});`);
    }

    const baseNode = nodes.find((n) => !edges.some((e) => e.target === n.id));
    if (!baseNode) {
      return codeLines.join("\n");
    }

    const queuedNodes: Node[] = [baseNode];
    const visitedNodes = new Set<string>([]);
    const dfsSortedNodesAndEdges: { edge: Edge }[] = [];

    while (queuedNodes.length > 0) {
      const currentNode = queuedNodes.shift();
      if (!currentNode) {
        break;
      }
      if (visitedNodes.has(currentNode.id)) {
        continue;
      }
      visitedNodes.add(currentNode.id);

      const outboundEdges = [...edges]
        .filter((e) => e.source === currentNode.id)
        .reverse();

      for (const edge of outboundEdges) {
        dfsSortedNodesAndEdges.push({ edge });

        const targetNode = nodes.find((n) => n.id === edge.target);
        if (!targetNode) {
          continue;
        }
        queuedNodes.unshift(targetNode);
      }
    }

    const nGoals = edges.filter((e) => e.target === GOAL_NODE_ID).length;

    const resolutionIds = new Set<string>([]);
    for (const { edge } of dfsSortedNodesAndEdges) {
      const edgeResolutionId = (edge.data?.resolutionId ?? "").toString();
      if (edgeResolutionId && resolutionIds.has(edgeResolutionId)) {
        continue;
      }
      resolutionIds.add(edgeResolutionId);
      const tacticName = (edge.data?.tactic ?? "").toString();
      const isLemma = edge.data?.isLemma ?? false;
      if (tacticName === "sorry") {
        if (nGoals > 1) {
          // TODO: add sorry code
          codeLines.push("if p.current_node: p.next_goal();");
        } else {
          // TODO: add sorry code
        }
      } else if (tacticName === "win") {
        // TODO: add win code
      } else if (!["sorry", "win"].includes(tacticName)) {
        if (isLemma) {
          codeLines.push(`p.use_lemma(${tacticName});`);
        } else {
          codeLines.push(`p.use(${tacticName});`);
        }
      }
    }
    codeLines.push("p.proof()");

    return codeLines.join("\n");
  },
);

interface PyodideState {
  code: string;
  pyodideLoaded: boolean;
  error: string | null;
  isJaspiError: boolean;
  serializedResult: string | null;
  stdout: string[];
  loading: boolean;
  proofOutput: Graph | null;
  proofComplete: boolean;
}

const initialState: PyodideState = {
  code: "",
  pyodideLoaded: false,
  error: null,
  isJaspiError: false,
  serializedResult: null,
  stdout: [],
  loading: false,
  proofOutput: null,
  proofComplete: false,
};

export const pyodideSlice = createSlice({
  name: "pyodide",
  initialState,
  reducers: {
    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadCustomPyodide.fulfilled, (state, action) => {
      state.pyodideLoaded = !!action.payload;
    });
    builder.addCase(runProofCode.pending, (state) => {
      state.loading = true;
      state.proofOutput = null;
      state.serializedResult = null;
      state.error = null;
      state.isJaspiError = false;
      state.stdout = [];
    });
    builder.addCase(convertProofGraphToCode.fulfilled, (state, action) => {
      if (!action.payload) {
        return;
      }
      state.code = action.payload;
    });
    builder.addCase(runProofCode.fulfilled, (state, action) => {
      if (!action.payload) {
        return;
      }
      const { result: pyodideResult, error: pyodideError } = action.payload;
      if (!pyodideResult) {
        state.loading = false;
        state.error = pyodideError;
        return;
      }
      const { result, stdResults, output, proofComplete, error } =
        pyodideResult;

      if (error) {
        state.loading = false;
        state.error = error;
        return;
      }

      state.loading = false;
      state.serializedResult = result ? String(result) : null;
      state.error = pyodideError
        ? pyodideError
        : result && String(result).includes("Error: Traceback")
          ? String(result)
          : null;
      state.isJaspiError =
        !!result &&
        String(result).includes(
          "WebAssembly stack switching not supported in this JavaScript runtime",
        );
      state.stdout = stdResults || [];
      state.proofOutput = output || null;
      state.proofComplete = proofComplete || false;
    });
  },
});

export const initializeCodegen = createAction("pyodide/initializeCodegen");

export const codegenListenerMiddleware = createListenerMiddleware();
codegenListenerMiddleware.startListening({
  matcher: isAnyOf(
    setNodes,
    setEdges,
    setVariables,
    setAssumptions,
    addAssumption,
    addVariables,
    applyTactic,
    setGoal,
    addVariables,
    initializeCodegen,
    loadProblem,
    removeEdge,
    resetProof,
  ),
  effect: async (_, listenerApi) => {
    listenerApi.cancelActiveListeners();
    const state = listenerApi.getState() as RootState;
    const { executionMode } = state.ui;
    if (executionMode === "auto") {
      await listenerApi.dispatch(setEditMode(VISUAL_EDIT_MODE));
      await listenerApi.dispatch(convertProofGraphToCode());
    }
  },
});

export const { setCode } = pyodideSlice.actions;

export const selectCode = (state: RootState) => state.pyodide.code;
export const selectPyodideLoaded = (state: RootState) =>
  state.pyodide.pyodideLoaded;
export const selectIsJaspiError = (state: RootState) =>
  state.pyodide.isJaspiError;
export const selectSerializedResult = (state: RootState) =>
  state.pyodide.serializedResult;
export const selectError = (state: RootState) => state.pyodide.error;
export const selectStdout = (state: RootState) => state.pyodide.stdout;
export const selectLoading = (state: RootState) => state.pyodide.loading;
export const selectProofOutput = (state: RootState) =>
  state.pyodide.proofOutput;
export const selectProofComplete = (state: RootState) =>
  state.pyodide.proofComplete;
export const selectProofError = (state: RootState) => state.pyodide.error;

export default pyodideSlice.reducer;
