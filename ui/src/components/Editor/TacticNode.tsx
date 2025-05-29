import { Edge, Handle, Position } from "@xyflow/react";
import { useState } from "react";
import LatexString from "./LatexString";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover";
import { Button } from "../Button";
import { Input } from "../Input";
import { AVAILABLE_TACTICS } from "./BaseNode";
import { useAppSelector } from "../../store";
import { selectProofOutput } from "../../features/pyodide/pyodideSlice";

export default function TacticNode({ 
  id,
  edges,
  applyTacticToNode
}: {
  id: string, edges: Edge[], applyTacticToNode: (nodeId: string, tactic: string) => void
}) {

  const [tacticOpen, setTacticOpen] = useState(false);
  const [tacticSearch, setTacticSearch] = useState('');

  const proofOutput = useAppSelector(selectProofOutput);

  const simplifiedResult = proofOutput?.[id];

  const tactic = edges.find((edge) => edge.source === id);

  const cleanResult = simplifiedResult
    ?.trim()
    ?.replace("Proof Assistant is in tactic mode.", "")
    ?.replace("Proof Assistant is in proof mode.", "")
    ?.replace("Current proof state:", "")
    ?.replace("&", "\\land")
    ?.replace(/: real/g, "\\in \\mathbb{R} ")
    ?.trim()
    ?.replace(/\n/g, '\\\\ ');

  return (
    <div className='flex flex-col gap-2'>
      <Handle type="target" position={Position.Top} id={`${id}-top`} />
      {
        cleanResult ? (
          <div className="tacticnode border border-gray-300 rounded-md p-2 items-center justify-center text-center">
            <span className="text-xs">
              <LatexString latex={cleanResult} />
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
          <Popover open={tacticOpen} onOpenChange={setTacticOpen}>
            <PopoverTrigger>
              <Button variant='outline' size='xs'>
                <LatexString latex={`+`} /> apply tactic
              </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-white">
              <div className='flex flex-col gap-2'>
                <Input
                  autoFocus
                  value={tacticSearch}
                  onChange={(e) => setTacticSearch(e.target.value)}
                />
                <div>
                  {AVAILABLE_TACTICS.filter(tactic => tactic.name.toLowerCase().includes(tacticSearch.toLowerCase())).map(tactic => (
                    <div
                      key={tactic.value}
                      className='cursor-pointer hover:bg-gray-100 rounded-md p-2'
                      onClick={() => {
                        setTacticOpen(false);
                        applyTacticToNode(id, tactic.value);
                      }}
                    >
                      {tactic.name}
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )
      }
    </div>
  );
}