import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  applyEdgeChanges,
  applyNodeChanges,
} from "@xyflow/react";
import type { WritableDraft } from "immer";
import { v4 as uuidv4 } from "uuid";
import {
  GOAL_NODE_ID,
  GOAL_NODE_TYPE,
  SORRY_TACTIC,
  TACTIC_EDGE_TYPE,
  TACTIC_NODE_TYPE,
} from "../../metadata/graph";
import type { VariableType } from "../../metadata/variables";
import type { RootState } from "../../store";
import { runProofCode } from "../pyodide/pyodideSlice";
import { CODE_EDIT_MODE } from "../ui/uiSlice";
import { layoutGraphElements } from "./dagre";

export type Variable = {
  name: string;
  type: VariableType;
};

export type Relation = {
  input: string;
  name: string;
};

export type Goal = {
  input: string;
};

interface ProofState {
  nodes: Node[];
  edges: Edge[];
  variables: Variable[];
  goal: Goal;
  assumptions: Relation[];
}

const initialState: ProofState = {
  nodes: [],
  edges: [],
  variables: [
    {
      name: "x",
      type: "nonneg_real",
    },
    {
      name: "y",
      type: "nonneg_real",
    },
    {
      name: "z",
      type: "nonneg_real",
    },
  ],
  assumptions: [
    {
      input: "x < 2*y",
      name: "h1",
    },
    {
      input: "y < 3*z + 1",
      name: "h2",
    },
  ],
  goal: {
    input: "x < 7 * z + 2",
  },
};

export const proofSlice = createSlice({
  name: "proof",
  initialState,
  reducers: {
    setVariables: (state, action: PayloadAction<Variable[]>) => {
      state.variables = action.payload;
    },
    addVariables: (state, action: PayloadAction<Variable[]>) => {
      state.variables = [...state.variables, ...action.payload];
    },
    setAssumptions: (state, action: PayloadAction<Relation[]>) => {
      state.assumptions = action.payload;
    },
    addAssumption: (state, action: PayloadAction<Relation>) => {
      state.assumptions = [...state.assumptions, action.payload];
    },
    setGoal: (state, action: PayloadAction<Goal>) => {
      state.goal = action.payload;
    },
    onNodesChange: (state, action: PayloadAction<NodeChange[]>) => {
      state.nodes = applyNodeChanges(action.payload, state.nodes);
    },
    onEdgesChange: (state, action: PayloadAction<EdgeChange[]>) => {
      state.edges = applyEdgeChanges(action.payload, state.edges);
    },
    removeEdge: (state, action: PayloadAction<string>) => {
      const edgeId = action.payload;
      const edgeToRemove = state.edges.find((e) => e.id === edgeId);
      const edgeSource = edgeToRemove?.source;
      if (!edgeSource) {
        return;
      }

      const otherEdgesToRemove = state.edges.filter(
        (e) =>
          edgeToRemove?.data?.resolutionId &&
          e.data?.resolutionId === edgeToRemove?.data?.resolutionId,
      );
      const edgeIdsToRemove = [...otherEdgesToRemove, edgeToRemove].map(
        (e) => e?.id,
      );

      const target = state.nodes.find((n) => n.id === edgeToRemove?.target);
      const newEdges = state.edges.filter(
        (e) => !edgeIdsToRemove.includes(e.id),
      );
      const newNodes = state.nodes.filter((n) => n.id !== target?.id);

      state.edges = [
        ...newEdges,
        {
          id: uuidv4(),
          source: edgeSource,
          target: GOAL_NODE_ID,
          type: TACTIC_EDGE_TYPE,
          data: { tactic: SORRY_TACTIC },
          animated: true,
        },
      ];
      state.nodes = newNodes;
    },
    resetProof: (state) => {
      const sourceNode = state.nodes.find(
        (node) => !state.edges.some((edge) => edge.target === node.id),
      );
      if (!sourceNode) {
        return;
      }
      const sinkNode = state.nodes.find(
        (node) => !state.edges.some((edge) => edge.source === node.id),
      );
      if (!sinkNode) {
        return;
      }
      state.nodes = [sourceNode, sinkNode];
      state.edges = [
        {
          id: uuidv4(),
          source: sourceNode.id,
          target: sinkNode.id,
          type: TACTIC_EDGE_TYPE,
          data: { tactic: SORRY_TACTIC },
        },
      ];
    },
    loadProblem: (
      state,
      action: PayloadAction<{
        variables: Variable[];
        assumptions: Relation[];
        goal: Goal;
      }>,
    ) => {
      state.nodes = initialState.nodes as WritableDraft<Node[]>;
      state.edges = initialState.edges;
      state.variables = action.payload.variables;
      state.assumptions = action.payload.assumptions;
      state.goal = action.payload.goal;
    },
    applyTactic: (
      state,
      action: PayloadAction<{
        nodeId: string;
        tactic: string;
        isLemma: boolean;
      }>,
    ) => {
      const newNodeId = uuidv4();
      const newNodes = [
        ...state.nodes,
        {
          id: newNodeId,
          data: {
            selected: true,
            isLemma: action.payload.isLemma,
          },
          type: TACTIC_NODE_TYPE,
          position: { x: 0, y: 0 },
          deletable: false,
        },
      ];

      const newEdgeId = uuidv4();
      const newEdges = [
        // remove edges coming out of node we're applying tactic to
        ...state.edges.filter((edge) => edge.source !== action.payload.nodeId),
        {
          id: newEdgeId,
          source: newNodeId,
          target: GOAL_NODE_ID,
          type: TACTIC_EDGE_TYPE,
          data: {
            tactic: SORRY_TACTIC,
          },
          animated: true,
          deletable: false,
        },
        {
          id: uuidv4(),
          source: action.payload.nodeId,
          target: newNodeId,
          type: TACTIC_EDGE_TYPE,
          data: {
            tactic: action.payload.tactic,
            isLemma: action.payload.isLemma,
            resolved: false,
          },
          deletable: false,
        },
      ];

      const layoutResult = layoutGraphElements(newNodes, newEdges);
      state.nodes = layoutResult.nodes as WritableDraft<Node[]>;
      state.edges = layoutResult.edges;
    },
    fixLayout: (state) => {
      const layoutResult = layoutGraphElements(state.nodes, state.edges);
      state.nodes = layoutResult.nodes as WritableDraft<Node[]>;
      state.edges = layoutResult.edges;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(runProofCode.fulfilled, (state, action) => {
      if (!action.payload) {
        return;
      }
      if (!action.payload) {
        return;
      }
      const {
        result: pyodideResult,
        error: pyodideError,
        editMode,
      } = action.payload;

      if (editMode === CODE_EDIT_MODE) {
        return;
      }

      if (!pyodideResult || pyodideError) {
        return;
      }
      if (pyodideResult.error) {
        return;
      }
      const pyodideNodes = pyodideResult.output?.nodes as {
        id: string;
        label: string;
        tactic: string;
        sorry_free: boolean;
      }[];
      const pyodideEdges = pyodideResult.output?.edges as {
        id: string;
        source: string;
        target: string;
        label: string;
      }[];

      const flowEdges: Edge[] = [];
      const flowNodes: Node[] = [];
      for (const n of pyodideNodes) {
        flowNodes.push({
          id: n.id,
          position: {
            x: 0,
            y: 0,
          },
          deletable: false,
          type: TACTIC_NODE_TYPE,
          data: {
            label: n.label,
          },
        });
        const edgesFromNode = pyodideEdges.filter((e) => e.source === n.id);

        const existingNodeEdge = state.edges.find((e) => e.source === n.id);

        if (!edgesFromNode.length) {
          if (n.sorry_free) {
            flowEdges.push({
              id: uuidv4(),
              source: n.id,
              target: GOAL_NODE_ID,
              type: TACTIC_EDGE_TYPE,
              data: {
                tactic: existingNodeEdge?.data?.tactic || n.tactic,
                resolved: true,
              },
              deletable: false,
            });
          } else {
            flowEdges.push({
              id: uuidv4(),
              source: n.id,
              target: GOAL_NODE_ID,
              type: TACTIC_EDGE_TYPE,
              data: { tactic: SORRY_TACTIC, resolved: true },
              animated: true,
              deletable: false,
            });
          }
        }
      }

      const unresolvedEdge = state.edges.find(
        (e) => e.data?.resolved === false,
      );
      const resolutionId = uuidv4();
      for (const e of pyodideEdges) {
        const edgeId = `${e.source}_${e.target}`;
        const existingEdge = state.edges.find(
          (edge) => edge.id === `${e.source}_${e.target}`,
        );

        const tactic = existingEdge
          ? existingEdge?.data?.tactic
          : unresolvedEdge
            ? unresolvedEdge?.data?.tactic
            : e.label;
        const isLemma = existingEdge
          ? existingEdge?.data?.isLemma
          : unresolvedEdge
            ? unresolvedEdge?.data?.isLemma
            : false;

        flowEdges.push({
          id: edgeId,
          source: e.source,
          target: e.target,
          type: TACTIC_EDGE_TYPE,
          data: {
            tactic,
            resolutionId: existingEdge?.data?.resolutionId || resolutionId,
            isLemma,
          },
          deletable: false,
        });
      }

      flowNodes.push({
        id: GOAL_NODE_ID,
        position: {
          x: 0,
          y: 0,
        },
        deletable: false,
        type: GOAL_NODE_TYPE,
        data: {
          label: state.goal.input,
        },
      });
      const layoutResult = layoutGraphElements(flowNodes, flowEdges);
      state.nodes = layoutResult.nodes as WritableDraft<Node[]>;
      state.edges = layoutResult.edges;
    });
  },
});

export const {
  onNodesChange,
  onEdgesChange,
  removeEdge,
  resetProof,
  addAssumption,
  loadProblem,
  setVariables,
  setAssumptions,
  setGoal,
  applyTactic,
  fixLayout,
  addVariables,
} = proofSlice.actions;

export const selectNodes = (state: RootState) => state.proof.nodes;
export const selectEdges = (state: RootState) => state.proof.edges;
export const selectNodeById = (id: string) => (state: RootState) =>
  state.proof.nodes.find((node) => node.id === id);
export const selectEdgesFromNode = (id: string) => (state: RootState) =>
  state.proof.edges.filter((edge) => edge.source === id);
export const selectVariables = (state: RootState) => state.proof.variables;
export const selectAssumptions = (state: RootState) => state.proof.assumptions;
export const selectGoal = (state: RootState) => state.proof.goal;

export default proofSlice.reducer;
