import '@xyflow/react/dist/style.css';
import { Input } from '../Input';
import { Button } from '../Button';
import { SelectValue } from '../Select';
import { SelectContent, SelectItem, SelectTrigger } from '../Select';
import { Select } from '../Select';
import LatexString from './LatexString';
import { Goal, Relation, Variable, VariableType } from './proofGraph';
import { TrashIcon } from '@heroicons/react/16/solid';
import { useAppDispatch } from '../../store';
import { useAppSelector } from '../../store';


export default function AssumptionMode({
  variables,
  setVariables,
  relations,
  setRelations,
  goal,
  setGoal,
  addVariable,
}: {
  variables: Variable[];
  setVariables: (variables: Variable[]) => void;
  relations: Relation[];
  setRelations: (relations: Relation[]) => void;
  goal: Goal;
  setGoal: (goal: Goal) => void;
  addVariable: (type: VariableType, namePrefix: string) => void;
}) {

  return (
    <div className='flex flex-col gap-2 h-full'>
      <div className='font-bold'>
        Assumptions Mode
      </div>
      <div className='font-medium'>
        Declare variables
      </div>
      <div className='grid grid-cols-5 lg:grid-cols-10 gap-2'>
        {
          variables.map((variable, index) => (
            <>
              <Input
                required
                id="variables"
                placeholder="Write variable name in LaTex"
                value={variable.name}
                onChange={(e) => setVariables(variables.map((v, i) => i === index ? { ...v, name: e.target.value } : v))}
                className='col-span-3'
              />
              <Select
                value={variable.type}
                onValueChange={(value) => setVariables(variables.map((v, i) => i === index ? { ...v, type: value as VariableType } : v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="real"><LatexString latex='\mathbb{R}' /></SelectItem>
                  <SelectItem value="int"><LatexString latex='\mathbb{Z}' /></SelectItem>
                  <SelectItem value="bool"><LatexString latex='\mathbb{B}' /></SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => setVariables(variables.filter((_, i) => i !== index))}
                variant='destructive'
                disabled={index === 0}
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
        <Button onClick={() => addVariable('real', 'x')} size='xs' variant='outline'>
          <LatexString latex='x_1' /> add real
        </Button>
        <Button onClick={() => addVariable('int', 'z')} size='xs' variant='outline'>
          <LatexString latex='z_1' /> add integer
        </Button>
        <Button onClick={() => addVariable('bool', 'b')} size='xs' variant='outline'>
          <LatexString latex='b_1' /> add boolean
        </Button>
      </div>
      <div className='font-medium'>
        Define hypotheses
      </div>
      <div className="grid grid-cols-5 lg:grid-cols-10 w-full items-center gap-1.5">
        {
          relations.map((relation, index) => (
            <>
              <Input required id="assumptions"
                placeholder="Use LaTex syntax, x_1, x_2, ..."
                value={relation.input}
                onChange={(e) => setRelations(relations.map((r, i) => i === index ? { ...r, input: e.target.value, validated: false } : r))}
                className='col-span-4'
              />
              <Button
                onClick={() => setRelations(relations.filter((_, i) => i !== index))}
                variant='destructive'
                disabled={index === 0}
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
        <Button onClick={() => setRelations([...relations, { input: '', valid: false }])} size='sm' variant='outline'>
          <LatexString latex='+' /> add relation
        </Button>
      </div>
      <div className='font-medium'>
        State goal
      </div>
      <div className='grid grid-cols-3 lg:grid-cols-6 xl:grid-cols-9 w-full items-center gap-1.5'>
        <Input required id="goal"
          placeholder="Use LaTex syntax, x_1, x_2, ..."
          value={goal.input}
          onChange={(e) => setGoal({ ...goal, input: e.target.value })}
          className='col-span-3 lg:col-span-6 xl:col-span-3'
        />
      </div>
    </div>
  );
}