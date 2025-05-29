import { ArrowLeftIcon } from "lucide-react";
import { Variable } from "./proofGraph";
import { Button } from "../Button";

export default function TacticMode({
  variables,
  setVariables,
  goToAssumptionMode
}: {
  variables: Variable[];
  setVariables: (variables: Variable[]) => void;
  goToAssumptionMode: () => void;
}) {
  return (
    <div className='flex flex-col gap-2 h-full'>
      <div className='font-bold'>
        Tactic Mode
      </div>
      <div className='flex-1' />
      <div>
        <Button size='sm' variant='primary' onClick={goToAssumptionMode}>
          <ArrowLeftIcon className='size-4' />
          Enter proof mode
        </Button>
      </div>
    </div>
  )
}