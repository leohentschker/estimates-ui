import { Handle, Position } from "@xyflow/react";
import { Goal } from "../../../features/proof/proofSlice";
import LatexString from "../LatexString";
import { useMemo } from "react";
import { useAppSelector } from "../../../store";
import { selectProofComplete } from "../../../features/pyodide/pyodideSlice";
import classNames from "classnames";

export default function GoalNode({
  id,
  goal
}: {
  id: string;
  goal: Goal;
}) {
  const goalLatex = useMemo(() => {
    return `${goal.input}`;
  }, [goal]);

  const isProofComplete = useAppSelector(selectProofComplete);

  return (
    <>
    <div
        className={
          classNames(
            'goalnode border rounded-md p-2 w-48 items-center justify-center text-center',
            {
              'border-gray-300': isProofComplete,
              'border-green-800': isProofComplete,
            }
          )
        }
      >
        <LatexString latex={goalLatex} />
      </div>
      <Handle type="target" position={Position.Top} id={`${id}-top`} />
    </>
  );
}