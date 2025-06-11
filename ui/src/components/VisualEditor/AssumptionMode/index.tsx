import '@xyflow/react/dist/style.css';
import { addVariables } from '../../../features/proof/proofSlice';
import { useAppDispatch, useAppSelector } from '../../../store';
import { useEffect } from 'react';
import VariableForm from './VariableForm';
import HypothesesForm from './HypothesesForm';
import GoalForm from './GoalForm';

export default function AssumptionMode() {
  const appDispatch = useAppDispatch();
  const variables = useAppSelector(state => state.proof.variables);

  useEffect(() => {
    if (variables.length === 0) {
      appDispatch(addVariables([{ name: 'x', type: 'real' }]));
    }
  }, [variables]);

  return (
    <div className='flex flex-col gap-6 h-full max-w-3xl mx-auto p-12 w-full'>
      <VariableForm />
      <HypothesesForm />
      <GoalForm />
    </div>
  );
}