import { useMemo, useState } from "react";
import LatexString from "../LatexString";
import { Popover, PopoverContent, PopoverTrigger } from "../../Popover";
import { Button } from "../../Button";
import { Input } from "../../Input";
import { useAppSelector } from "../../../store";
import { selectAssumptions, selectVariables } from "../../../features/proof/proofSlice";
import classNames from "classnames";

type Tactic = {
  name: string;
  value: string;
  arguments: ('variables' | 'hypotheses' | 'verbose')[];
}
export const AVAILABLE_TACTICS: Tactic[] = [
  { name: 'Linear arithmetic', value: 'Linarith', arguments: ['verbose'] },
  { name: 'Contrapositive', value: 'Contrapose', arguments: [] },
  { name: 'Split hypothesis', value: 'SplitHyp', arguments: ['hypotheses'] },
  { name: 'Cases', value: 'Cases', arguments: ['hypotheses'] },
  { name: "Simplify", value: "SimpAll", arguments: [] },
  { name: 'Split goal', value: 'SplitGoal', arguments: [] },
  { name: 'Log linear arithmetic', value: 'LogLinarith', arguments: [] },
]

type Lemma = {
  name: string;
  arguments: 'expressions';
  value: string;
}
export const AVAILABLE_LEMMAS: Lemma[] = [
  { name: 'AM-GM Inequality', value: 'Amgm', arguments: 'expressions' },
]

export default function TacticPopover({
  applyLemmaToNode,
  applyTacticToNode,
  nodeId
}: {
  applyLemmaToNode: (nodeId: string, lemma: string) => void;
  applyTacticToNode: (nodeId: string, tactic: string) => void;
  nodeId: string;
}) {
  const [tacticSearch, setTacticSearch] = useState('');
  const [tacticOpen, setTacticOpen] = useState(false);

  const [tacticSelectStep, setTacticSelectStep] = useState<'select' | 'arguments' | 'lemma'>('select');
  const [selectedTactic, setSelectedTactic] = useState<Tactic>();
  const [tacticArguments, setTacticArguments] = useState<string[]>([]);
  const [selectedLemma, setSelectedLemma] = useState<Lemma>();
  const [lemmaArguments, setLemmaArguments] = useState<string>('');
  const variables = useAppSelector(selectVariables);
  const hypotheses = useAppSelector(selectAssumptions);

  const argumentSelectOptions = useMemo(() => {
    let options: { label: string, value: string }[] = [];
    if (!selectedTactic) {
      return [];
    }
    if (selectedTactic.arguments.includes('variables')) {
      options.push(...variables.map(variable => ({ label: variable.name, value: variable.name })));
    }
    if (selectedTactic.arguments.includes('hypotheses')) {
      options.push(...hypotheses.map(hypothesis => ({ label: `${hypothesis.name}: ${hypothesis.input}`, value: hypothesis.name })));
    }
    if (selectedTactic.arguments.includes('verbose')) {
      options.push({ label: 'verbose=True', value: 'verbose=True' }, { label: 'verbose=False', value: 'verbose=False' });
    }
    return options;
  }, [selectedTactic]);

  return (
    <Popover open={tacticOpen} onOpenChange={setTacticOpen}>
      <PopoverTrigger>
        <Button variant='outline' size='xs'>
          <LatexString latex={`+`} /> apply tactic
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-white z-200000">
        <div className='flex flex-col gap-2'>

          {
            tacticSelectStep === 'select' && (
              <>
                <Input
                  autoFocus
                  value={tacticSearch}
                  onChange={(e) => setTacticSearch(e.target.value)}
                  className="mb-4"
                />
                <div className="text-sm font-bold">
                  Tactics
                </div>
                <div className="max-h-32 overflow-y-auto">
                  {AVAILABLE_TACTICS.filter(tactic => tactic.name.toLowerCase().includes(tacticSearch.toLowerCase())).map(tactic => (
                    <div
                      key={tactic.value}
                      className='cursor-pointer hover:bg-gray-100 rounded-md p-2'
                      onClick={() => {
                        const selectedTactic = AVAILABLE_TACTICS.find(availableTactic => availableTactic.name === tactic?.name);
                        if (!selectedTactic) {
                          return;
                        }
                        if (selectedTactic.arguments.length > 0) {
                          setTacticSelectStep('arguments');
                          setSelectedTactic(selectedTactic);
                        } else {
                          setTacticOpen(false);
                          applyTacticToNode(nodeId, `${tactic.value}()`);
                        }
                      }}
                    >
                      {tactic.name}
                    </div>
                  ))}
                </div>
                <div className="text-sm font-bold">
                  Lemmas
                </div>
                <div className="overflow-y-auto">
                  {AVAILABLE_LEMMAS.filter(lemma => lemma.name.toLowerCase().includes(tacticSearch.toLowerCase())).map(lemma => (
                    <div
                      key={lemma.name}
                      className={
                        classNames(
                          'cursor-pointer hover:bg-gray-100 rounded-md p-2',
                          selectedLemma === lemma && 'bg-gray-100'
                        )
                      }
                      onClick={() => {
                        setSelectedLemma(lemma);
                        setTacticSelectStep('lemma');
                        setLemmaArguments('');
                      }}
                    >
                      {lemma.name}
                    </div>
                  ))}

                </div>
              </>
            )
          }

          {
            tacticSelectStep === 'lemma' && (
              <>
                <div>
                  Arguments for {selectedLemma?.name}
                </div>
                <div className="flex flex-col gap-2 py-5">
                  <div className="flex items-center">
                    <span>{selectedLemma?.value}(</span>
                    <Input
                      value={lemmaArguments}
                      onChange={(e) => setLemmaArguments(e.target.value)}
                      className="col-span-2 mx-2"
                      placeholder="x**2,y**2"
                    />
                    <span>)</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setTacticSelectStep('select');
                      setLemmaArguments('');
                    }}
                    className="w-full" variant='outline' size='xs'>
                    <LatexString latex={`<-`} /> back
                  </Button>
                  <Button
                    onClick={() => {
                      applyLemmaToNode(nodeId, `${selectedLemma?.value}(${lemmaArguments})`);
                      setTacticOpen(false);
                    }}
                    disabled={lemmaArguments.length === 0}
                    className="w-full" variant='primary' size='xs'
                  >
                    <LatexString latex={`+`} /> apply lemma
                  </Button>
                </div>
              </>
            )
          }

          {
            tacticSelectStep === 'arguments' && (
              <>
                <div>
                  Arguments for {selectedTactic?.name}
                </div>
                <div className="flex flex-col gap-2">
                  {
                    <div>
                      {argumentSelectOptions.map(argument => (
                        <div
                          key={argument.value}
                          onClick={() => {
                            setTacticArguments([argument.value]);
                          }}
                          className={
                            classNames(
                              "cursor-pointer hover:bg-gray-100 rounded-md p-2 w-full",
                              tacticArguments.includes(argument.value) && 'bg-gray-100'
                            )
                          }
                        >
                          {argument.label}
                        </div>
                      ))}
                    </div>
                  }
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setTacticSelectStep('select');
                        setTacticArguments([]);
                      }}
                      className="w-full" variant='outline' size='xs'>
                      <LatexString latex={`<-`} /> back
                    </Button>
                    <Button
                      onClick={() => {
                        applyTacticToNode(nodeId, `${selectedTactic?.value}("${tacticArguments.join(', ')}")`);
                        setTacticOpen(false);
                      }}
                      disabled={tacticArguments.length === 0}
                      className="w-full" variant='primary' size='xs'
                    >
                      <LatexString latex={`+`} /> apply tactic
                    </Button>
                  </div>
                </div>
              </>
            )
          }
        </div>
      </PopoverContent>
    </Popover>
  );
}