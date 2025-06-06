import { Background, BackgroundVariant, NodeTypes, ReactFlow, EdgeTypes, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMemo, useRef } from 'react';
import BaseNode from './Nodes/BaseNode';
import GoalNode from './Nodes/GoalNode';
import TacticNode from './Nodes/TacticNode';
import TacticEdge from './TacticEdge';
import { useAppDispatch } from '../../store';
import { selectEdges, onNodesChange, onEdgesChange, removeEdge, resetProof, selectVariables, selectAssumptions, selectGoal, applyTactic } from '../../features/proof/proofSlice';
import { selectNodes } from '../../features/proof/proofSlice';
import { useAppSelector } from '../../store';
import { Button } from '../Button';


export default function VisualEditor(): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  const nodes = useAppSelector(selectNodes);
  const edges = useAppSelector(selectEdges);
  const appDispatch = useAppDispatch();
  const variables = useAppSelector(selectVariables);
  const relations = useAppSelector(selectAssumptions);
  const goal = useAppSelector(selectGoal);

  const handleApplyTacticToNode = (nodeId: string, tactic: string) => {
    appDispatch(applyTactic({ nodeId, tactic, isLemma: false }));
  };

  const handleApplyLemmaToNode = (nodeId: string, lemma: string) => {
    appDispatch(applyTactic({ nodeId, tactic: lemma, isLemma: true }));
  };

  const nodeTypes: NodeTypes = useMemo(() => ({
    base: (props) => (
      <BaseNode
        {...props}
        applyTacticToNode={(nodeId, tactic) => handleApplyTacticToNode(nodeId, tactic)}
        applyLemmaToNode={(nodeId, lemma) => handleApplyLemmaToNode(nodeId, lemma)}
        relations={relations}
        variables={variables}
        edges={edges}
      />
    ),
    goal: (props) => <GoalNode {...props} goal={goal} />,
    tactic: props => (
      <TacticNode
        {...props}
        edges={edges}
        applyTacticToNode={handleApplyTacticToNode}
        applyLemmaToNode={handleApplyLemmaToNode}
      />
    ),
  }), [variables, relations, edges, goal]);

  const edgeTypes: EdgeTypes = useMemo(() => ({
    'tactic-edge': props => (
      <TacticEdge
        {...props}
        handleRemoveEdge={() => appDispatch(removeEdge(props.id))}
      />
    ),
  }), [edges]);

  return (
    <div ref={containerRef} className='flex-1 relative'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        draggable={false}
        nodesDraggable={true}
        nodesConnectable={false}
        onNodesDelete={() => false}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        contentEditable={false}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.1}
        maxZoom={4}
        onNodesChange={changes => appDispatch(onNodesChange(changes))}
        onEdgesChange={changes => appDispatch(onEdgesChange(changes))}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
      </ReactFlow>
    </div>
  )
}