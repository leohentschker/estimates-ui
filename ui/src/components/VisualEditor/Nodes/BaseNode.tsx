import { useMemo } from "react";
import LatexString from "../LatexString";
import { Edge, Handle, Position } from "@xyflow/react";
import { Relation, Variable, VariableType, TYPE_TO_SET } from "../../../features/proof/proofSlice";
import { pythonToLatex } from "../../../features/pyodide/latexToPython";
import TacticPopover from "./TacticPopover";

export default function BaseNode({
  applyTacticToNode,
  applyLemmaToNode,
  relations,
  variables,
  edges,
  id
}: {
  applyTacticToNode: (nodeId: string, tactic: string) => void;
  applyLemmaToNode: (nodeId: string, lemma: string) => void;
  relations: Relation[];
  variables: Variable[];
  edges: Edge[];
  id: string;
}) {
  const tactic = edges.find((edge) => edge.source === id);

  const relationsLatex = useMemo(() => {
    return relations.filter((relation) => relation.input).map((relation) => {
      return pythonToLatex(relation.input);
    }).join('\\\\');
  }, [relations.map((relation) => relation.input).join('')]);
  const variablesByTypeLatex = useMemo(() => {
    const variabelsByType = variables.filter((variable) => variable.name).reduce((acc, variable) => {
      acc[variable.type] = [...(acc[variable.type] || []), variable.name];
      return acc;
    }, {} as Record<VariableType, string[]>);

    const latexStrings = Object.entries(variabelsByType).map(([type, variables]) =>
      `${variables.join(', ')} \\in ${TYPE_TO_SET[type as VariableType]}`
    ).join('\\\\');

    return latexStrings;
  }, [variables]);

  return (
      <div className='flex flex-col gap-2'>
        <div
          className='basenode border border-gray-300 rounded-md p-2 w-48 items-center justify-center text-center flex flex-col gap-2'
        >
          {
            variablesByTypeLatex ? (
              <LatexString latex={`${variablesByTypeLatex}`} />
            ) : (
              <LatexString latex={'missing\\ variables'} />
            )
          }
          {
            relationsLatex && (
              <LatexString latex={`${relationsLatex}`} />
            )
          }
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
            <TacticPopover
              applyTacticToNode={applyTacticToNode}
              applyLemmaToNode={applyLemmaToNode}
              nodeId={id}
            />
          )
        }
      </div>
  );
}