import {
  Background,
  BackgroundVariant,
  type EdgeTypes,
  type NodeTypes,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { RecycleIcon } from "lucide-react";
import {
  onEdgesChange,
  onNodesChange,
  resetProof,
  selectEdges,
} from "../../features/proof/proofSlice";
import { selectNodes } from "../../features/proof/proofSlice";
import {
  selectLoading,
  selectPyodideLoaded,
} from "../../features/pyodide/pyodideSlice";
import {
  GOAL_NODE_TYPE,
  TACTIC_EDGE_TYPE,
  TACTIC_NODE_TYPE,
} from "../../metadata/graph";
import { useAppDispatch } from "../../store";
import { useAppSelector } from "../../store";
import { Button } from "../Button";
import LoadingState from "../LoadingState";
import GoalNode from "./Nodes/GoalNode";
import TacticNode from "./Nodes/TacticNode";
import TacticEdge from "./TacticEdge";

export default function VisualEditor(): React.ReactElement {
  const appDispatch = useAppDispatch();

  const nodes = useAppSelector(selectNodes);
  const edges = useAppSelector(selectEdges);
  const pyodideLoaded = useAppSelector(selectPyodideLoaded);
  const pyodideLoading = useAppSelector(selectLoading);

  const nodeTypes: NodeTypes = {
    [GOAL_NODE_TYPE]: GoalNode,
    [TACTIC_NODE_TYPE]: TacticNode,
  };

  const edgeTypes: EdgeTypes = {
    [TACTIC_EDGE_TYPE]: TacticEdge,
  };

  if (pyodideLoading || !pyodideLoaded) {
    return <LoadingState message="Initializing builder..." />;
  }

  return (
    <div className="flex-1 relative">
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
        onNodesChange={(changes) => appDispatch(onNodesChange(changes))}
        onEdgesChange={(changes) => appDispatch(onEdgesChange(changes))}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
      </ReactFlow>
      <div className="absolute top-0 right-0 p-4 z-1000">
        <Button onClick={() => appDispatch(resetProof())}>
          <RecycleIcon className="w-4 h-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}
