import { Handle, Position } from "@xyflow/react";
import { selectEdges } from "../../../features/proof/proofSlice";
import { useAppSelector } from "../../../store";
import RenderedNodeText from "./RenderedNodeText";
import TacticPopover from "./TacticPopover";

export default function TacticNode({
  id,
  data,
}: {
  id: string;
  data: {
    label: string;
  };
}) {
  const simplifiedResult = data.label;

  const edges = useAppSelector(selectEdges);
  const outboundEdge = edges.find((edge) => edge.source === id);
  const hasInboundEdges = edges.some((edge) => edge.target === id);

  return (
    <div className="flex flex-col gap-2">
      {hasInboundEdges && (
        <Handle type="target" position={Position.Top} id={`${id}-top`} />
      )}
      {simplifiedResult ? (
        <div className="border border-gray-300 rounded-md p-2 items-center justify-center text-center">
          <span className="text-xs max-w-16">
            <RenderedNodeText text={simplifiedResult} />
          </span>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-md p-2 w-48 items-center justify-center text-center">
          <div className="animate-pulse flex flex-col gap-2">
            <div className="h-2 bg-gray-200 rounded w-3/4" />
            <div className="h-2 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      )}
      {outboundEdge && (
        <Handle
          type="source"
          position={Position.Bottom}
          id={`${id}-tactic-bottom`}
        />
      )}
      {(!outboundEdge || outboundEdge.data?.tactic === "sorry") && (
        <TacticPopover nodeId={id} />
      )}
    </div>
  );
}
