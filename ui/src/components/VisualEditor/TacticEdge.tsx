import { BaseEdge, MarkerType, getStraightPath } from "@xyflow/react";

import { EdgeLabelRenderer } from "@xyflow/react";
import { PencilIcon } from "lucide-react";
import { removeEdge } from "../../features/proof/proofSlice";
import { SORRY_TACTIC } from "../../metadata/graph";
import { useAppDispatch } from "../../store";
import LatexString from "./LatexString";
import TacticPopover from "./Nodes/TacticPopover";

export default function TacticEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  source,
}: {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  data: { tactic: string };
  source: string;
}) {
  const appDispatch = useAppDispatch();
  const handleRemoveEdge = (edgeId: string) => appDispatch(removeEdge(edgeId));

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={MarkerType.ArrowClosed} />
      <EdgeLabelRenderer>
        <button
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          className="bg-white rounded-md px-2 py-1"
          type="button"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs">{data.tactic?.replace("_", " ")}</span>
            {data.tactic !== SORRY_TACTIC && (
              <div className="text-xs absolute -right-4 top-1/2 -translate-y-3 flex items-center gap-1/2 justify-center">
                <TacticPopover nodeId={source}>
                  <PencilIcon className="w-2 h-2 cursor-pointer hover:text-blue-500" />
                </TacticPopover>
                <button
                  type="button"
                  className="text-xs cursor-pointer hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveEdge(id);
                  }}
                >
                  <LatexString latex="-" />
                </button>
              </div>
            )}
          </div>
        </button>
      </EdgeLabelRenderer>
    </>
  );
}
