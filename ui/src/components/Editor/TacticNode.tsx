import { Edge, Handle, Position } from "@xyflow/react";
import { useEffect, useState } from "react";
import LatexString from "./LatexString";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover";
import { Button } from "../Button";
import { Input } from "../Input";
import { AVAILABLE_TACTICS } from "./BaseNode";

export default function TacticNode({ 
  id,
  edges,
  applyTacticToNode
}: {
  id: string, edges: Edge[], applyTacticToNode: (nodeId: string, tactic: string) => void
}) {
  const [simplifiedResult, setSimplifiedResult] = useState<string>('');
  useEffect(() => {
    const fetchSimplifiedResult = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSimplifiedResult('2x_1 + 2x_2 > 0');
    };
    fetchSimplifiedResult();
  }, []);

  const [tacticOpen, setTacticOpen] = useState(false);
  const [tacticSearch, setTacticSearch] = useState('');

  const tactic = edges.find((edge) => edge.source === id);

  return (
    <div className='flex flex-col gap-2'>
      <Handle type="target" position={Position.Top} id={`${id}-top`} />
      {
        simplifiedResult ? (
          <div className="tacticnode border border-gray-300 rounded-md p-2 w-48 items-center justify-center text-center">
            <LatexString latex={simplifiedResult} />
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