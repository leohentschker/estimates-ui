import "@xyflow/react/dist/style.css";
import { useEffect } from "react";
import { addVariables } from "../../../features/proof/proofSlice";
import { useAppDispatch, useAppSelector } from "../../../store";
import GoalForm from "./GoalForm";
import HypothesesForm from "./HypothesesForm";
import VariableForm from "./VariableForm";

export default function AssumptionMode() {
  const appDispatch = useAppDispatch();
  const variables = useAppSelector((state) => state.proof.variables);

  useEffect(() => {
    if (variables.length === 0) {
      appDispatch(addVariables([{ name: "x", type: "real" }]));
    }
  }, [variables, appDispatch]);

  return (
    <div className="flex flex-col gap-6 h-full max-w-3xl mx-auto p-12 w-full">
      <VariableForm />
      <HypothesesForm />
      <GoalForm />
    </div>
  );
}
