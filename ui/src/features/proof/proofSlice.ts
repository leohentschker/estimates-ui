import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import { applyEdgeChanges, applyNodeChanges, Edge, EdgeChange, Node, NodeChange } from '@xyflow/react'
import { v4 as uuidv4 } from 'uuid';
import Dagre from 'dagre';
import { runProofCode } from '../pyodide/pyodideSlice';

const getLayoutedElements = (nodes: Node[], edges: Edge[], options: any) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction, nodesep: 500, ranksep: 150 });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 0,
      height: node.measured?.height ?? 0,
    }),
  );
  Dagre.layout(g);
  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;
      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

export type VariableType = 'pos_real' | 'real' | 'int' | 'bool' | 'pos_int' | 'nonneg_real';

export type Variable = {
  name: string;
  type: VariableType;
}

export type Relation = {
  input: string;
  name: string;
  valid: boolean;
}

export type Goal = {
  input: string;
  valid: boolean;
}

export const TYPE_TO_SET = {
  pos_real: '\\mathbb{R}^+',
  pos_int: '\\mathbb{Z}^+',
  real: '\\mathbb{R}',
  int: '\\mathbb{Z}',
  bool: '\\mathbb{B}',
  nonneg_real: '\\mathbb{R}_{\\geq 0}',
}

interface ProofState {
  nodes: Node[];
  edges: Edge[];
  variables: Variable[];
  goal: Goal;
  assumptions: Relation[];
}

export const GOAL_NODE_ID = 'goal-node';
const initialState: ProofState = {
  nodes: [],
  edges: [],
  variables: [
    {
      name: 'x_1',
      type: 'real'
    },
    {
      name: 'x_2',
      type: 'real'
    }
  ],
  assumptions: [
    {
      input: 'x_1 + x_2 > 0',
      valid: true,
      name: 'h1'
    }
  ],
  goal: {
    input: 'Or(x_1 > 0, x_2 > 0)',
    valid: true
  }
};

export const proofSlice = createSlice({
  name: 'proof',
  initialState,
  reducers: {
    setNodes: (state, action: PayloadAction<Node[]>) => {
      state.nodes = action.payload;
    },
    setEdges: (state, action: PayloadAction<Edge[]>) => {
      state.edges = action.payload;
    },
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

      const otherEdgesToRemove = state.edges.filter((e) => edgeToRemove?.data?.resolutionId && e.data?.resolutionId === edgeToRemove?.data?.resolutionId);
      const edgeIdsToRemove = [...otherEdgesToRemove, edgeToRemove].map((e) => e?.id);

      console.log(edgeIdsToRemove, 'EDGE IDS TO REMOVE');

      const target = state.nodes.find((n) => n.id === edgeToRemove?.target);
      const newEdges = state.edges.filter((e) => !edgeIdsToRemove.includes(e.id));
      const newNodes = state.nodes.filter((n) => n.id !== target?.id);
      console.log('REMOVED', newEdges.length - state.edges.length, 'EDGES');

      state.edges = [...newEdges, {
        id: uuidv4(),
        source: edgeSource,
        target: GOAL_NODE_ID,
        type: 'tactic-edge',
        data: { tactic: 'sorry' },
        animated: true,
      }];
      state.nodes = newNodes;
    },
    handleProofIncomplete: (state) => {
      const sorryEdge = state.edges.find((edge) => edge.data?.tactic === 'sorry');
      if (sorryEdge) {
        return;
      }
      const winEdge = state.edges.find((edge) => edge.data?.tactic === 'win');
      if (!winEdge) {
        console.log('No win edge, sorry edge found, and proof incomplete');
        return;
      }
      const newEdges = [
        ...state.edges.filter((edge) => edge.id !== winEdge?.id),
        {
          id: uuidv4(),
          source: winEdge.source,
          target: winEdge.target,
          type: 'tactic-edge',
          data: { tactic: 'sorry' },
          animated: true,
        }
      ];
      state.edges = newEdges;
    },
    handleProofComplete: (state) => {
      const sorryEdge = state.edges.find((edge) => edge.data?.tactic === 'sorry');
      const winningTacticNode = state.nodes.find((node) => node.id === sorryEdge?.source);
      if (!winningTacticNode) {
        return;
      }
      const edgeIntoWinningTacticNode = state.edges.find((edge) => edge.target === winningTacticNode?.id);
      if (!edgeIntoWinningTacticNode) {
        return;
      }

      const nodeBeforeWinningTacticNode = state.nodes.find((node) => node.id === edgeIntoWinningTacticNode?.source);
      if (!nodeBeforeWinningTacticNode) {
        return;
      }

      const newEdges = [
        ...state.edges.filter((edge) => edge.id !== sorryEdge?.id && edge.id !== edgeIntoWinningTacticNode?.id),
        {
          id: uuidv4(),
          source: nodeBeforeWinningTacticNode.id,
          target: GOAL_NODE_ID,
          type: 'tactic-edge',
          data: { tactic: edgeIntoWinningTacticNode.data?.tactic },
        }
      ];
      state.edges = newEdges;
      state.nodes = state.nodes.filter((node) => node.id !== winningTacticNode?.id);
    },
    resetProof: (state) => {
      const sourceNode = state.nodes.find((node) => !state.edges.some((edge) => edge.target === node.id));
      if (!sourceNode) {
        return;
      }
      const sinkNode = state.nodes.find((node) => !state.edges.some((edge) => edge.source === node.id));
      if (!sinkNode) {
        return;
      }
      state.nodes = [sourceNode, sinkNode];
      state.edges = [
        {
          id: uuidv4(),
          source: sourceNode.id,
          target: sinkNode.id,
          type: 'tactic-edge',
          data: { tactic: 'sorry' },
        }
      ];
    },
    loadProblem: (state, action: PayloadAction<{
      variables: Variable[];
      assumptions: Relation[];
      goal: Goal;
    }>) => {
      state.nodes = initialState.nodes;
      state.edges = initialState.edges;
      state.variables = action.payload.variables;
      state.assumptions = action.payload.assumptions;
      state.goal = action.payload.goal;
    },
    applyTactic: (state, action: PayloadAction<{
      nodeId: string;
      tactic: string;
      isLemma: boolean;
    }>) => {
      const newNodeId = uuidv4();
      const newNodes = [...state.nodes, {
        id: newNodeId,
        data: {
          selected: true,
          isLemma: action.payload.isLemma,
        },
        type: 'tactic',
        position: { x: 0, y: 0 },
        deletable: false
      }];

      const newEdgeId = uuidv4();
      const newEdges = [
        // remove edges coming out of node we're applying tactic to
        ...state.edges.filter(edge => edge.source !== action.payload.nodeId),
        {
          id: newEdgeId,
          source: newNodeId,
          target: GOAL_NODE_ID,
          type: 'tactic-edge',
          data: {
            tactic: 'sorry'
          },
          animated: true,
          deletable: false
        },
        {
          id: uuidv4(),
          source: action.payload.nodeId,
          target: newNodeId,
          type: 'tactic-edge',
          data: {
            tactic: action.payload.tactic,
            isLemma: action.payload.isLemma,
            resolved: false
          },
          deletable: false
        }
      ];
      const layoutResult = getLayoutedElements(newNodes, newEdges, { direction: 'TB' });
      state.nodes = layoutResult.nodes;
      state.edges = layoutResult.edges;
    },
    fixLayout: (state) => {
      const layoutResult = getLayoutedElements(state.nodes, state.edges, { direction: 'TB' });
      state.nodes = layoutResult.nodes;
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
      const { result: pyodideResult, error: pyodideError } = action.payload;
      if (!pyodideResult || pyodideError) {
        return;
      }
      if (pyodideResult.error) {
        console.error('PYODIDE ERROR', pyodideResult.error);
        return;
      }
      const pyodideNodes = pyodideResult.output.nodes as { id: string, label: string, tactic: string, sorry_free: boolean }[];
      const pyodideEdges = pyodideResult.output.edges as { id: string, source: string, target: string, label: string }[];

      const flowEdges: Edge[] = [];
      const flowNodes: Node[] = [];
      for (const n of pyodideNodes) {
        flowNodes.push({
          id: n.id,
          position: {
            x: 0,
            y: 0
          },
          deletable: false,
          type: 'tactic',
          data: {
            label: n.label,
          }
        });
        const edgesFromNode = pyodideEdges.filter((e) => e.source === n.id);
        
        const existingNodeEdge = state.edges.find((e) => e.source === n.id);

        if (!edgesFromNode.length) {
          if (n.sorry_free) {
            flowEdges.push({
              id: uuidv4(),
              source: n.id,
              target: GOAL_NODE_ID,
              type: 'tactic-edge',
              data: { tactic: existingNodeEdge?.data?.tactic || n.tactic, resolved: true },
              deletable: false
            });
          } else {
            flowEdges.push({
              id: uuidv4(),
              source: n.id,
              target: GOAL_NODE_ID,
              type: 'tactic-edge',
              data: { tactic: 'sorry', resolved: true },
              animated: true,
              deletable: false
            });
          }
        }
      }

      const unresolvedEdge = state.edges.find(e => e.data?.resolved === false);
      const resolutionId = uuidv4();
      for (const e of pyodideEdges) {
        const edgeId = `${e.source}_${e.target}`;
        const existingEdge = state.edges.find((edge) => edge.id === `${e.source}_${e.target}`);

        const tactic = existingEdge ? existingEdge?.data?.tactic : unresolvedEdge ? unresolvedEdge?.data?.tactic : e.label;

        flowEdges.push({
          id: edgeId,
          source: e.source,
          target: e.target,
          type: 'tactic-edge',
          data: { tactic, resolutionId },
          deletable: false
        });
      }

      flowNodes.push({
        id: GOAL_NODE_ID,
        position: {
          x: 0,
          y: 0
        },
        deletable: false,
        type: 'goal',
        data: {
          label: state.goal.input,
        }
      });
      const layoutResult = getLayoutedElements(flowNodes, flowEdges, { direction: 'TB' });
      state.nodes = layoutResult.nodes;
      state.edges = layoutResult.edges;
    });
  },
});

export const {
  setNodes,
  setEdges,
  onNodesChange,
  onEdgesChange,
  removeEdge,
  handleProofComplete,
  handleProofIncomplete,
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
export const selectNodeById = (id: string) => (state: RootState) => state.proof.nodes.find((node) => node.id === id);
export const selectEdgesFromNode = (id: string) => (state: RootState) => state.proof.edges.filter((edge) => edge.source === id);
export const selectVariables = (state: RootState) => state.proof.variables;
export const selectAssumptions = (state: RootState) => state.proof.assumptions;
export const selectGoal = (state: RootState) => state.proof.goal;

export default proofSlice.reducer