import { Edge, Handle, Position } from "@xyflow/react";
import { useState } from "react";
import LatexString from "../LatexString";
import { useAppSelector } from "../../../store";
import { selectProofOutput } from "../../../features/pyodide/pyodideSlice";
import { pythonToLatex } from "../../../features/pyodide/latexToPython";
import TacticPopover from "./TacticPopover";

const stripEstimatesPrefixes = (result: string) => {
  return result
    .replace(/Proof Assistant is in tactic mode./, '')
    .replace(/Current proof state:/, '')
    .replace(/: bool/g, '\\in\\mathbb{B},\\\\')
    .replace(/: int/g, '\\in\\mathbb{Z},\\\\')
    .replace(/: real/g, '\\in\\mathbb{R},\\\\')
    .replace(/: nat/g, '\\in\\mathbb{N},\\\\')
    .replace(/: pos_int/g, '\\in\\mathbb{Z}^+,\\\\')
    .replace(/: pos_real/g, '\\in\\mathbb{R}^+,\\\\')
    .replace(/This is goal \d+ of \d+/, '')
    .trim();
}

export default function TacticNode({ 
  id,
  edges,
  applyTacticToNode
}: {
  id: string, edges: Edge[], applyTacticToNode: (nodeId: string, tactic: string) => void
}) {
  const proofOutput = useAppSelector(selectProofOutput);

  const simplifiedResult = stripEstimatesPrefixes(proofOutput?.[id] || '');

  const tactic = edges.find((edge) => edge.source === id);

  return (
    <div className='flex flex-col gap-2'>
      <Handle type="target" position={Position.Top} id={`${id}-top`} />
      {
        simplifiedResult ? (
          <div className="tacticnode border border-gray-300 rounded-md p-2 items-center justify-center text-center">
            <span className="text-xs">
              <LatexString latex={pythonToLatex(simplifiedResult)} />
            </span>
          </div>
        ) : (
          <div className="tacticnode border border-gray-300 rounded-md p-2 w-48 items-center justify-center text-center">
            <div className="animate-pulse flex flex-col gap-2">
              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        )
      }
      {
        tactic && (
          <Handle
            type="source"
            position={Position.Bottom}
            id={`${id}-tactic-bottom`}
          />
        )
      }
      {
        (!tactic || tactic.data?.tactic === 'sorry') && (
          <TacticPopover
            applyTacticToNode={applyTacticToNode}
            nodeId={id}
          />
        )
      }
    </div>
  );
}