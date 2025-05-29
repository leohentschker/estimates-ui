import { Handle, Position } from "@xyflow/react";
import { Goal } from "./proofGraph";
import LatexString from "./LatexString";
import { useMemo } from "react";

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

  return (
    <>
    <div
      className='goalnode border border-gray-300 rounded-md p-2 w-48 items-center justify-center text-center'
    >
        <LatexString latex={goalLatex} />
      </div>
      <Handle type="target" position={Position.Top} id={`${id}-top`} />
    </>
  );
}