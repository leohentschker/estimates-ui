import { Handle, Position } from "@xyflow/react";
import classNames from "classnames";
import { selectGoal } from "../../../features/proof/proofSlice";
import { selectProofComplete } from "../../../features/pyodide/pyodideSlice";
import { useAppSelector } from "../../../store";
import RenderedNodeText from "./RenderedNodeText";

export default function GoalNode({ id }: { id: string }) {
  const goal = useAppSelector(selectGoal);
  const isProofComplete = useAppSelector(selectProofComplete);

  return (
    <>
      <div
        className={classNames(
          "goalnode border rounded-md p-2 w-48 items-center justify-center text-center",
          {
            "border-gray-300": isProofComplete,
            "border-green-800": isProofComplete,
          },
        )}
      >
        <RenderedNodeText text={goal.input} />
      </div>
      <Handle type="target" position={Position.Top} id={`${id}-top`} />
    </>
  );
}
