import '@xyflow/react/dist/style.css';
import { Input } from '../Input';
import { Button } from '../Button';
import { SelectValue } from '../Select';
import { SelectContent, SelectItem, SelectTrigger } from '../Select';
import { Select } from '../Select';
import LatexString from './LatexString';
import { addVariables, Goal, Relation, setAssumptions, setGoal, Variable, VariableType } from '../../features/proof/proofSlice';
import { TrashIcon } from '@heroicons/react/16/solid';
import { TYPE_TO_SET } from '../../features/proof/proofSlice';
import { useAppDispatch } from '../../store';
import { useEffect } from 'react';

export default function AssumptionMode({
  variables,
  setVariables,
  relations,
  goal,
}: {
  variables: Variable[];
  setVariables: (variables: Variable[]) => void;
  relations: Relation[];
  goal: Goal;
}) {
  const appDispatch = useAppDispatch();
  useEffect(() => {
    if (variables.length === 0) {
      appDispatch(addVariables([{ name: '', type: 'real' }]));
    }
  }, [variables]);

  return (
    <div className='flex flex-col gap-2 h-full'>
      <div className='font-bold'>
        Assumptions
      </div>
      <div className='font-medium'>
        Declare variables
      </div>
      <div className='grid grid-cols-4 lg:grid-cols-8 gap-2'>
        {
          variables.map((variable, index) => (
            <>
              <Input
                required
                id="variables"
                placeholder="x_1, x_2, ..."
                value={variable.name}
                onChange={(e) => setVariables(variables.map((v, i) => i === index ? { ...v, name: e.target.value } : v))}
                className='col-span-2'
              />
              <Select
                value={variable.type}
                onValueChange={(value) => setVariables(variables.map((v, i) => i === index ? { ...v, type: value as VariableType } : v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {
                    Object.entries(TYPE_TO_SET).map(([type, latex]) => (
                      <SelectItem key={type} value={type}>
                        <LatexString latex={latex} />
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              <Button
                onClick={() => setVariables(variables.filter((_, i) => i !== index))}
                variant='destructive'
                disabled={variables.length === 1}
              >
                <div className='flex items-center gap-1 w-full justify-center'>
                  <TrashIcon className='size-4' />
                </div>
              </Button>
            </>
          ))
        }
      </div>
      <div className='flex gap-2'>
        <Button onClick={() => appDispatch(addVariables([{ name: '', type: 'real' }]))} size='xs' variant='outline'>
          <LatexString latex='x_1' /> add real
        </Button>
        <Button onClick={() => appDispatch(addVariables([{ name: '', type: 'int' }]))} size='xs' variant='outline'>
          <LatexString latex='z_1' /> add integer
        </Button>
        <Button onClick={() => appDispatch(addVariables([{ name: '', type: 'bool' }]))} size='xs' variant='outline'>
          <LatexString latex='b_1' /> add bool
        </Button>
        <Button onClick={() => appDispatch(addVariables([{ name: '', type: 'pos_int' }]))} size='xs' variant='outline'>
          <LatexString latex='p_1' /> add positive integer
        </Button>
        <Button onClick={() => appDispatch(addVariables([{ name: '', type: 'pos_real' }]))} size='xs' variant='outline'>
          <LatexString latex='r_1' /> add positive real
        </Button>
      </div>
      <div className='font-medium'>
        Define hypotheses
      </div>
      <div className="grid grid-cols-4 lg:grid-cols-8 w-full items-center gap-1.5">
        {
          relations.map((relation, index) => (
            <>
              <Input required id="assumptions"
                placeholder="Use LaTex syntax, x_1, x_2, ..."
                value={relation.input}
                onChange={(e) => appDispatch(setAssumptions(
                  relations.map((r, i) => i === index ? { ...r, input: e.target.value, validated: false } : r)
                ))}
                className='col-span-2'
              />
              <Input required id="assumptions-name"
                placeholder="h_1, h_2, ..."
                value={relation.name}
                onChange={(e) => appDispatch(setAssumptions(
                  relations.map((r, i) => i === index ? { ...r, name: e.target.value } : r)
                ))}
              />
              <Button
                onClick={() => appDispatch(setAssumptions(relations.filter((_, i) => i !== index)))}
                variant='destructive'
                disabled={relations.length === 1}
              >
                <div className='flex items-center gap-1 w-full justify-center'>
                  <TrashIcon className='size-4' />
                </div>
              </Button>
            </>
          ))
        }
      </div>
      <div className='flex gap-2'>
        <Button onClick={() => appDispatch(setAssumptions([...relations, { input: '', valid: false, name: '' }]))} size='sm' variant='outline'>
          <LatexString latex='+' /> add relation
        </Button>
      </div>
      <div className='font-medium'>
        State goal
      </div>
      <div className='grid grid-cols-3 lg:grid-cols-6 w-full items-center gap-1.5'>
        <Input required id="goal"
          placeholder="Use LaTex syntax, x_1, x_2, ..."
          value={goal.input}
          onChange={(e) => appDispatch(setGoal({ ...goal, input: e.target.value }))}
          className='col-span-3 lg:col-span-6 xl:col-span-3'
        />
      </div>
      <div className='flex gap-2'>
        <Button onClick={() => appDispatch(setGoal({ ...goal, input: 'Eq(x_1, x_2)' }))} size='sm' variant='outline'>
          <LatexString latex='=' /> add equality
        </Button>
        <Button onClick={() => appDispatch(setGoal({ ...goal, input: `Not(${goal.input})` }))} size='sm' variant='outline'>
          <LatexString latex='\neg' /> negate
        </Button>
      <Button onClick={() => appDispatch(setGoal({ ...goal, input: `And(${goal.input}, ${goal.input})` }))} size='sm' variant='outline'>
        <LatexString latex='\land' /> and
      </Button>
      <Button onClick={() => appDispatch(setGoal({ ...goal, input: `Or(${goal.input}, ${goal.input})` }))} size='sm' variant='outline'>
        <LatexString latex='\lor' /> or
      </Button>
      <Button onClick={() => appDispatch(setGoal({ ...goal, input: `Implies(${goal.input}, ${goal.input})` }))} size='sm' variant='outline'>
        <LatexString latex='\implies' /> implies
      </Button>
      </div>
    </div>
  );
}