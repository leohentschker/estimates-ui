import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import { applyEdgeChanges, applyNodeChanges, Edge, EdgeChange, Node, NodeChange } from '@xyflow/react'
import { v4 as uuidv4 } from 'uuid';

export type VariableType = 'pos_real' | 'real' | 'int' | 'bool';

export type Variable = {
  name: string;
  type: VariableType;
}

export type Relation = {
  input: string;
  valid: boolean;
}

export type Goal = {
  input: string;
  valid: boolean;
}

export const TYPE_TO_SET = {
  pos_real: '\\mathbb{R}_{\\geq 0}',
  real: '\\mathbb{R}',
  int: '\\mathbb{Z}',
  bool: '\\mathbb{B}',
}

interface ProofState {
  nodes: Node[];
  edges: Edge[];
  variables: Variable[];
  goal: Goal;
  assumptions: Relation[];
}

const initialState: ProofState = {
  nodes: [
    {
      id: 'base-node',
      position: { x: 0, y: 0 },
      data: {
        selected: true,
      },
      type: 'base',
    },
    {
      id: 'goal-node',
      position: { x: 0, y: 300 },
      data: {
      },
      type: 'goal',
    }
  ],
  edges: [
    {
      id: 'base-node-goal-edge',
      source: 'base-node',
      target: 'goal-node',
      type: 'tactic-edge',
      data: { tactic: 'sorry' },
      animated: true,
    }
  ],
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
      valid: true
    }
  ],
  goal: {
    input: 'x_1 > 0 \\lor x_2 > 0',
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
    setAssumptions: (state, action: PayloadAction<Relation[]>) => {
      state.assumptions = action.payload;
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
      const target = state.nodes.find((n) => n.id === edgeToRemove?.target);
      const newEdges = state.edges.filter((e) => e.id !== edgeId);
      const newNodes = state.nodes.filter((n) => n.id !== target?.id);
      const edgeSource = edgeToRemove?.source;

      state.edges = [...newEdges, {
        id: uuidv4(),
        source: edgeSource!,
        target: 'goal-node',
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
          target: 'goal-node',
          type: 'tactic-edge',
          data: { tactic: edgeIntoWinningTacticNode.data?.tactic },
        }
      ];
      state.edges = newEdges;
      state.nodes = state.nodes.filter((node) => node.id !== winningTacticNode?.id);
    },
    resetProof: (state) => {
      state.nodes = initialState.nodes;
      state.edges = initialState.edges;
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
  loadProblem,
  setVariables,
  setAssumptions,
  setGoal,
} = proofSlice.actions;

export const selectNodes = (state: RootState) => state.proof.nodes;
export const selectEdges = (state: RootState) => state.proof.edges;
export const selectNodeById = (id: string) => (state: RootState) => state.proof.nodes.find((node) => node.id === id);
export const selectEdgesFromNode = (id: string) => (state: RootState) => state.proof.edges.filter((edge) => edge.source === id);
export const selectVariables = (state: RootState) => state.proof.variables;
export const selectAssumptions = (state: RootState) => state.proof.assumptions;
export const selectGoal = (state: RootState) => state.proof.goal;

export default proofSlice.reducer