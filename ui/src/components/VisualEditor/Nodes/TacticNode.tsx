import { Handle, Position } from "@xyflow/react";
import { selectEdges } from "../../../features/proof/proofSlice";
import { REPLACABLE_SYMBOLS } from "../../../metadata/symbols";
import { SUPPORTED_VARIABLE_TYPES } from "../../../metadata/variables";
import { useAppSelector } from "../../../store";
import LatexString from "../LatexString";
import TacticPopover from "./TacticPopover";

const LATEX_TRANSLATIONS = [
  ...SUPPORTED_VARIABLE_TYPES,
  ...REPLACABLE_SYMBOLS,
].reduce(
  (acc, type) => {
    acc[type.name] = type.symbol;
    return acc;
  },
  {} as Record<string, string>,
);

function RenderedNodeText({ text }: { text: string }) {
  const typePattern = [
    ...SUPPORTED_VARIABLE_TYPES.map((t) => t.name),
    ...REPLACABLE_SYMBOLS.map((t) => t.pattern),
  ].join("|");
  const parts = text.split(new RegExp(`(${typePattern})`, "g"));
  return (
    <div className="border border-gray-300 rounded-md p-2 items-center justify-center text-center">
      <span className="text-xs max-w-16">
        {parts.map((part) => {
          if (LATEX_TRANSLATIONS[part]) {
            return <LatexString latex={LATEX_TRANSLATIONS[part]} />;
          }
          return part;
        })}
      </span>
    </div>
  );
}

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
        <RenderedNodeText text={simplifiedResult} />
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
