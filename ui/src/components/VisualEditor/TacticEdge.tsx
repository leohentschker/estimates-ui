import { BaseEdge, getStraightPath, MarkerType } from "@xyflow/react";

import { EdgeLabelRenderer } from "@xyflow/react";
import LatexString from "./LatexString";
import { useAppSelector } from "../../store";
import { selectEdgesFromNode } from "../../features/proof/proofSlice";

export default function TacticEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  handleRemoveEdge,
  target
}: {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  data: { tactic: string };
  handleRemoveEdge: (edgeId: string) => void;
  target: string;
}) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX, targetY,
  });

  const edgesFromTarget = useAppSelector(selectEdgesFromNode(target));
  const outboundEdgeIsSorry = edgesFromTarget.some((edge) => edge.data?.tactic === 'sorry');

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={MarkerType.ArrowClosed}
      />
      <EdgeLabelRenderer>
        <button
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="bg-white rounded-md px-2 py-1"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs">
              {data.tactic?.replace('\_', ' ')}
            </span>
            {
              outboundEdgeIsSorry &&
              <span
                className="text-xs absolute -right-2 top-1/2 -translate-y-3 cursor-pointer hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveEdge(id);
                }}
              >
                <LatexString latex={`-`} />
              </span>
            }
          </div>
        </button>
      </EdgeLabelRenderer>
    </>
  )
}