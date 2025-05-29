import { useMemo, useState } from "react";
import { Button } from "../Button";
import { Input } from "../Input";
import { Popover, PopoverTrigger } from "../Popover";
import { PopoverContent } from "../Popover";
import LatexString from "./LatexString";
import { Edge, Handle, Position } from "@xyflow/react";
import { Relation, Variable, VariableType } from "./proofGraph";
import { TYPE_TO_SET } from "./proofGraph";

export const AVAILABLE_TACTICS = [
  { name: 'Linear arithmetic', value: 'Linarith()' },
  { name: 'Contrapositive', value: 'Contrapose("h")' },
  { name: 'Split hypothesis', value: 'SplitHyp("h")' },
]

export default function BaseNode({
  applyTacticToNode,
  relations,
  variables,
  edges,
  id
}: {
  applyTacticToNode: (nodeId: string, tactic: string) => void;
  relations: Relation[];
  variables: Variable[];
  edges: Edge[];
  id: string;
}) {
  const tactic = edges.find((edge) => edge.source === id);

  const relationsLatex = useMemo(() => {
    return relations.map((relation) => {
      return `${relation.input}`;
    }).join('\\\\');
  }, [relations.map((relation) => relation.input).join('')]);
  const variablesByTypeLatex = useMemo(() => {
    const variabelsByType = variables.reduce((acc, variable) => {
      acc[variable.type] = [...(acc[variable.type] || []), variable.name];
      return acc;
    }, {} as Record<VariableType, string[]>);

    const latexStrings = Object.entries(variabelsByType).map(([type, variables]) =>
      `${variables.join(', ')} \\in ${TYPE_TO_SET[type as VariableType]}`
    ).join('\\\\');

    return latexStrings;
  }, [variables]);

  const [tacticSearch, setTacticSearch] = useState('');
  const [tacticOpen, setTacticOpen] = useState(false);

  return (
      <div className='flex flex-col gap-2'>
        <div
          className='basenode border border-gray-300 rounded-md p-2 w-48 items-center justify-center text-center'
        >
          <LatexString latex={`${variablesByTypeLatex} \\\\ ${relationsLatex}`} />
        </div>
        {
          tactic && (
            <Handle
              type="source"
              position={Position.Bottom}
              id={`base-node-bottom`}
            />
          )
        }
        {
          (!tactic || tactic?.data?.tactic === 'sorry') && (
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
                          applyTacticToNode(id, tactic.value);
                          setTacticOpen(false);
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