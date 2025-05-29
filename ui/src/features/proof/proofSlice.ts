import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import { applyEdgeChanges, applyNodeChanges, Edge, EdgeChange, Node, NodeChange } from '@xyflow/react'
import { v4 as uuidv4 } from 'uuid';

interface ProofState {
  nodes: Node[];
  edges: Edge[];
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
  },
});

export const { setNodes, setEdges, onNodesChange, onEdgesChange, removeEdge, handleProofComplete } = proofSlice.actions

export const selectNodes = (state: RootState) => state.proof.nodes;
export const selectEdges = (state: RootState) => state.proof.edges;
export const selectNodeById = (id: string) => (state: RootState) => state.proof.nodes.find((node) => node.id === id);
export const selectEdgesFromNode = (id: string) => (state: RootState) => state.proof.edges.filter((edge) => edge.source === id);

export default proofSlice.reducer