import { Background, BackgroundVariant, NodeTypes, ReactFlow, EdgeTypes, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEffect, useMemo, useRef } from 'react';
import AssumptionMode from './AssumptionMode';
import BaseNode from './Nodes/BaseNode';
import GoalNode from './Nodes/GoalNode';
import TacticNode from './Nodes/TacticNode';
import TacticEdge from './TacticEdge';
import { useAppDispatch } from '../../store';
import { selectEdges, onNodesChange, onEdgesChange, removeEdge, resetProof, selectVariables, selectAssumptions, selectGoal, setVariables, applyTactic } from '../../features/proof/proofSlice';
import { selectNodes } from '../../features/proof/proofSlice';
import { useAppSelector } from '../../store';
import { convertProofGraphToCode } from '../../features/pyodide/pyodideSlice';
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
    fitView();
  };

  const handleApplyLemmaToNode = (nodeId: string, lemma: string) => {
    appDispatch(applyTactic({ nodeId, tactic: lemma, isLemma: true }));
    fitView();
  };

  const nodeTypes: NodeTypes = useMemo(() => ({
    base: (props) => (
      <BaseNode
        {...props}
        applyTacticToNode={handleApplyTacticToNode}
        applyLemmaToNode={handleApplyLemmaToNode}
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

  useEffect(() => {
    appDispatch(convertProofGraphToCode({ edges, variables, relations, goal }));
  }, [edges, variables, relations, goal]);

  return (
    <div className='hidden md:block w-1/2 h-full flex-1'>
      <div ref={containerRef} className='h-[50%] border-b border-gray-200'>
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
        <div className='flex justify-end'>
          <Button
            className='-mt-16 mr-4 bg-white z-20000'
            onClick={() => {
              appDispatch(resetProof());
              fitView();
            }}
          >
            Reset
          </Button>
        </div>
      </div>
      <div className='w-full h-[50%] p-4 overflow-y-auto'>
        <AssumptionMode
          variables={variables}
          setVariables={setVariables}
          relations={relations}
          goal={goal}
        />
      </div>
    </div>
  )
}