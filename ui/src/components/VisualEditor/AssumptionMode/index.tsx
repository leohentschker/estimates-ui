import '@xyflow/react/dist/style.css';
import { Input } from '../../Input';
import { Button } from '../../Button';
import LatexString from '../LatexString';
import { addAssumption, addVariables, setAssumptions, setGoal, setVariables, VariableType } from '../../../features/proof/proofSlice';
import { TYPE_TO_SET } from '../../../features/proof/proofSlice';
import { useAppDispatch, useAppSelector } from '../../../store';
import { useEffect, useRef, useState } from 'react';
import { TypographyH3 } from '../../Typography';
import { ChevronDown, X } from 'lucide-react';
import { Plus } from 'lucide-react';
import classNames from 'classnames';
import { Card } from '../../Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../Select';

const logicalSymbols = [
  { symbol: " ∧ ", code: "And", description: "Logical AND" },
  { symbol: " ∨ ", code: "Or", description: "Logical OR" },
  { symbol: " ¬ ", code: "Not", description: "Logical NOT" },
  { symbol: " ⟹ ", code: "Implies", description: "Implies" },
  { symbol: " ≡ ", code: "Eq", description: "Equivalent" },
  { symbol: " = ", code: "Eq", description: "Equals" },
  { symbol: " ≠ ", code: "NotEq", description: "Not equal" },
  { symbol: " < ", code: "Lt", description: "Less than" },
  { symbol: " > ", code: "Gt", description: "Greater than" },
  { symbol: " ≤ ", code: "Leq", description: "Less than or equal" },
  { symbol: " ≥ ", code: "Geq", description: "Greater than or equal" },
  { symbol: " ∀ ", code: "ForAll", description: "For all" },
  { symbol: " ∃ ", code: "Exists", description: "There exists" },
]

export default function AssumptionMode() {
  const appDispatch = useAppDispatch();
  const variables = useAppSelector(state => state.proof.variables);
  const relations = useAppSelector(state => state.proof.assumptions);
  const goal = useAppSelector(state => state.proof.goal);

  const [showVariableForm, setShowVariableForm] = useState(false);
  const [showHypothesisForm, setShowHypothesisForm] = useState(false);
  const [goalFieldFocused, setGoalFieldFocused] = useState(false);

  const [newHypothesis, setNewHypothesis] = useState({
    expression: '',
    label: ''
  });
  const [newVariable, setNewVariable] = useState({
    name: '',
    type: 'real'
  });

  const goalInputRef = useRef<HTMLInputElement>(null);

  const insertSymbolAtCursor = (symbol: string) => {
    const input = goalInputRef.current
    if (!input) {
      console.log('No input')
      return;
    }

    const start = input.selectionStart || 0
    const end = input.selectionEnd || 0
    const newGoal = goal.input.slice(0, start) + symbol + goal.input.slice(end)
    appDispatch(setGoal({ input: newGoal, valid: false }))

    // Set cursor position after the inserted symbol
    setTimeout(() => {
      const newCursorPos = start + symbol.length
      input.setSelectionRange(newCursorPos, newCursorPos)
      input.focus()
    }, 0)
  }

  useEffect(() => {
    if (variables.length === 0) {
      appDispatch(addVariables([{ name: '', type: 'real' }]));
    }
  }, [variables]);

  return (
    <div className='flex flex-col gap-6 h-full max-w-3xl mx-auto px-12 py-12 w-full'>
      <div>
        <div className='flex items-center justify-between mb-3'>
          <TypographyH3>
            Variables
          </TypographyH3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowVariableForm(!showVariableForm)}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Variable
            <ChevronDown
              className={`h-4 w-4 ml-1 transition-transform ${showVariableForm ? "rotate-180" : ""}`}
            />
          </Button>
        </div>
        <div className="space-y-2 mb-3">
          {variables.map((variable) => (
            <div key={variable.name} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
              <span className="font-mono text-sm flex-1">
                {variable.name}: <LatexString latex={TYPE_TO_SET[variable.type]} />
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => appDispatch(setVariables(variables.filter((v) => v.name !== variable.name)))}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        {
          showVariableForm && (
            <Card className="p-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Expression</label>
                  <Input
                    placeholder="e.g., x, y, z"
                    value={newVariable.name}
                    onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Type</label>
                  <Select
                    value={newVariable.type}
                    onValueChange={(value) => setNewVariable({ ...newVariable, type: value })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real">Real (ℝ)</SelectItem>
                      <SelectItem value="integer">Integer (ℤ)</SelectItem>
                      <SelectItem value="pos_real">Positive Real (ℝ⁺)</SelectItem>
                      <SelectItem value="pos_integer">Positive Integer (ℤ⁺)</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      appDispatch(addVariables([{
                        name: newVariable.name,
                        type: newVariable.type as VariableType
                      }]))
                      setNewVariable({ name: '', type: 'real' })
                      setShowVariableForm(false)
                    }}
                    disabled={!newVariable.name.trim()}
                  >
                    Add Variable
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVariableForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )
        }
      </div>
      <div>
        <div className='flex items-center justify-between mb-3'>
          <TypographyH3>
            Hypotheses
          </TypographyH3>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setShowHypothesisForm(!showHypothesisForm)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Hypothesis
            <ChevronDown
              className={classNames("h-4 w-4 ml-1 transition-transform", showHypothesisForm && "rotate-180")}
            />
          </Button>
        </div>
        <div className="space-y-2 mb-3">
          {relations.map((relation, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
              <span className="font-mono text-sm flex-1">
                {relation.name}: {relation.input}
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => appDispatch(setAssumptions(relations.filter((r) => r.name !== relation.name)))}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        {
          showHypothesisForm && (
            <Card className="p-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Expression</label>
                  <Input
                    placeholder="e.g., x + y > 0"
                    value={newHypothesis.expression}
                    onChange={(e) => setNewHypothesis({ ...newHypothesis, expression: e.target.value })}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Label</label>
                  <Input
                    placeholder="e.g., h1, assumption1"
                    value={newHypothesis.label}
                    onChange={(e) => setNewHypothesis({ ...newHypothesis, label: e.target.value })}
                    className="h-8"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      appDispatch(addAssumption({
                        input: newHypothesis.expression,
                        name: newHypothesis.label,
                        valid: false
                      }))
                      setNewHypothesis({ expression: '', label: '' })
                      setShowHypothesisForm(false)
                    }}
                    disabled={!newHypothesis.expression.trim() || !newHypothesis.label.trim()}
                  >
                    Add Hypothesis
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHypothesisForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )
        }
      </div>
      <div>
        <div className='flex items-center justify-between mb-3'>
          <TypographyH3>
            Goal
          </TypographyH3>
        </div>
        <div className='grid grid-cols-3 w-full items-center gap-1.5 relative'>
          <Input required id="goal"
            placeholder="x_1, x_2, ..."
            value={goal.input}
            onChange={(e) => appDispatch(setGoal({ ...goal, input: e.target.value }))}
            className='col-span-3 lg:col-span-6 xl:col-span-3'
            onFocus={() => setGoalFieldFocused(true)}
            onBlur={() => setGoalFieldFocused(false)}
            ref={goalInputRef}
          />
          {goalFieldFocused && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
              <div className="text-xs text-gray-500 mb-2 px-1">Insert symbols:</div>
              <div className="flex flex-wrap gap-1">
                {logicalSymbols.map((item) => (
                  <Button
                    key={item.symbol}
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-sm hover:bg-gray-50 hover:text-gray-700"
                    onMouseDown={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      insertSymbolAtCursor(item.code)
                      setGoalFieldFocused(false)
                    }}
                    title={item.description}
                  >
                    {item.code.trim()}
                  </Button>
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-2 px-1">
                Click a symbol to insert it at your cursor position
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}