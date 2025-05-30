import { Background, BackgroundVariant, NodeTypes, ReactFlow, EdgeTypes, Edge, Node, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEffect, useMemo, useRef } from 'react';
import AssumptionMode from './AssumptionMode';
import BaseNode from './Nodes/BaseNode';
import GoalNode from './Nodes/GoalNode';
import TacticNode from './Nodes/TacticNode';
import TacticEdge from './TacticEdge';
import Dagre from 'dagre';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch } from '../../store';
import { selectEdges, setEdges, setNodes, onNodesChange, onEdgesChange, removeEdge, resetProof, VariableType, selectVariables, selectAssumptions, selectGoal, setVariables, setGoal, setAssumptions } from '../../features/proof/proofSlice';
import { selectNodes } from '../../features/proof/proofSlice';
import { useAppSelector } from '../../store';
import { convertProofGraphToCode } from '../../features/pyodide/pyodideSlice';
import { Button } from '../Button';

const getLayoutedElements = (nodes: Node[], edges: Edge[], options: any) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction, nodesep: 200, ranksep: 150 });

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

export default function VisualEditor(): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  const nodes = useAppSelector(selectNodes);
  const edges = useAppSelector(selectEdges);
  const appDispatch = useAppDispatch();
  const variables = useAppSelector(selectVariables);
  const relations = useAppSelector(selectAssumptions);
  const goal = useAppSelector(selectGoal);

  const addVariable = (type: VariableType, namePrefix: string) => {
    setVariables([...variables, { name: `${namePrefix}_${variables.length + 1}`, type }]);
  }

  const handleApplyTacticToNode = (nodeId: string, tactic: string) => {
    const newNodeId = uuidv4();
    const newNodes = [...nodes, {
      id: newNodeId,
      data: {
        selected: true,
      },
      type: 'tactic',
      position: { x: 0, y: 0 },
    }];

    const newEdgeId = uuidv4();
    const newEdges = [
      ...edges.filter(edge => edge.data?.tactic !== 'sorry'),
      {
        id: newEdgeId,
        source: newNodeId,
        target: 'goal-node',
        type: 'tactic-edge',
        data: {
          tactic: 'sorry'
        },
        animated: true,
      },
      {
        id: uuidv4(),
        source: nodeId,
        target: newNodeId,
        type: 'tactic-edge',
        data: {
          tactic: tactic
        },
      }
    ];
    const layouted = getLayoutedElements(newNodes, newEdges, { direction: 'TB' });
    appDispatch(setNodes([...layouted.nodes]));
    appDispatch(setEdges([...layouted.edges]));
    fitView();
  };

  const nodeTypes: NodeTypes = useMemo(() => ({
    base: (props) => (
      <BaseNode
        {...props}
        applyTacticToNode={handleApplyTacticToNode}
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
    <div className='w-full h-full'>
      <div ref={containerRef} className='w-full h-[50%] border-b border-gray-200'>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          draggable={false}
          nodesDraggable={true}
          nodesConnectable={false}
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
          setRelations={setAssumptions}
          goal={goal}
          setGoal={setGoal}
          addVariable={addVariable}
        />
      </div>
    </div>
  )
}