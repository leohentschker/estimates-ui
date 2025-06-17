import { Handle, Position } from "@xyflow/react";
import { useMemo } from "react";
import { selectEdges, selectNodes } from "../../../features/proof/proofSlice";
import { useAppSelector } from "../../../store";
import { Button } from "../../Button";
import LatexString from "../LatexString";
import RenderedNodeText from "./RenderedNodeText";
import TacticPopover from "./TacticPopover";
import { parseNodeState } from "./nodeStateHelpers";
import { SORRY_TACTIC } from "../../../metadata/graph";

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
  const nodes = useAppSelector(selectNodes);
  const outboundEdge = edges.find((edge) => edge.source === id);
  const isSourceNode = edges.some((edge) => edge.target === id);

  const baseNodeState = useMemo(() => {
    const sourceNode = nodes.find(
      (node) => !edges.some((edge) => edge.target === node.id),
    );
    if (!sourceNode) return null;
    const label = sourceNode.data.label;
    if (typeof label !== "string") return null;
    return parseNodeState(label);
  }, [edges, nodes]);

  const { variables, hypotheses, goal } = useMemo(
    () => parseNodeState(simplifiedResult),
    [simplifiedResult],
  );

  return (
    <div className="flex flex-col gap-2">
      {isSourceNode && (
        <Handle type="target" position={Position.Top} id={`${id}-top`} />
      )}
      {simplifiedResult ? (
        <div className="border border-gray-300 rounded-md p-2 flex flex-col gap-2 max-w-48 px-4 text-xs">
          <RenderedNodeText text={variables.join(", ")} />
          {hypotheses.map((line) => (
            <RenderedNodeText key={line} text={line} />
          ))}
          {goal !== baseNodeState?.goal && (
            <RenderedNodeText text={`|- ${goal}`} />
          )}
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
      {(!outboundEdge || outboundEdge.data?.tactic === SORRY_TACTIC) && (
        <TacticPopover nodeId={id}>
          <Button variant="outline" size="xs">
            <LatexString latex="+" /> apply tactic
          </Button>
        </TacticPopover>
      )}
    </div>
  );
}
