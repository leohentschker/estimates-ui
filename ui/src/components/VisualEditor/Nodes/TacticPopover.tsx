import classNames from "classnames";
import { useMemo, useState } from "react";
import {
  applyTactic,
  selectAssumptions,
  selectGoal,
  selectVariables,
} from "../../../features/proof/proofSlice";
import {
  AVAILABLE_LEMMAS,
  AVAILABLE_TACTICS,
  type Lemma,
  type Tactic,
} from "../../../metadata/tactics";
import { useAppDispatch, useAppSelector } from "../../../store";
import { Button } from "../../Button";
import { Input } from "../../Input";
import { Popover, PopoverContent, PopoverTrigger } from "../../Popover";
import LatexString from "../LatexString";

type Item = Tactic | Lemma;

type SelectedArg = {
  label: string;
  value: string;
  id: string;
};

export default function TacticPopover({
  nodeId,
  children,
}: {
  nodeId: string;
  children: React.ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"select" | "config">("select");
  const [selected, setSelected] = useState<Item>();
  const [args, setArgs] = useState<SelectedArg[]>([]);

  const variables = useAppSelector(selectVariables);
  const hypotheses = useAppSelector(selectAssumptions);
  const goal = useAppSelector(selectGoal);
  const dispatch = useAppDispatch();

  const apply = (tactic: Tactic | Lemma) => {
    const call = `${tactic.className}(${args.map((a) => a.value).join(", ")})`;
    dispatch(
      applyTactic({ nodeId, tactic: call, isLemma: tactic.type === "lemma" }),
    );
    setOpen(false);
  };

  const tacticOptions = useMemo(
    () =>
      AVAILABLE_TACTICS.filter(
        (t) =>
          !search ||
          t.label.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  const lemmaOptions = useMemo(
    () =>
      AVAILABLE_LEMMAS.filter(
        (l) =>
          !search ||
          l.label.toLowerCase().includes(search.toLowerCase()) ||
          l.description.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  const argOptions = useMemo(() => {
    if (!selected) return [];
    const tac = selected as Tactic;
    const opts: { label: string; value: string; id: string }[] = [];
    if (tac.arguments.includes("variables"))
      opts.push(
        ...variables.map((v) => ({ label: v.name, value: v.name, id: v.name })),
      );
    if (tac.arguments.includes("hypotheses"))
      opts.push(
        ...hypotheses.map((h) => ({
          label: `${h.name}: ${h.input}`,
          value: `"${h.name}"`,
          id: h.name,
        })),
      );
    if (tac.arguments.includes("verbose"))
      opts.push(
        { label: "verbose=True", value: "verbose=True", id: "verbose=True" },
        { label: "verbose=False", value: "verbose=False", id: "verbose=False" },
      );
    if (tac.arguments.includes("this"))
      opts.push({
        label: "none (applies to current state)",
        value: "",
        id: goal.input,
      });
    if (tac.arguments.includes("expressions"))
      opts.push({ label: "Expression", value: "Expression", id: "expression" });
    return opts;
  }, [selected, variables, hypotheses, goal]);

  const applyTacticDisabled = useMemo(() => {
    if (selected?.arguments.length === 0) return false;
    return args.length === 0 || args[0].id === "";
  }, [args, selected]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="bg-white z-200000">
        <div className="flex flex-col gap-2">
          {step === "select" && (
            <>
              <Input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-4"
              />
              <div className="text-sm font-bold">Tactics</div>
              <div className="max-h-40 overflow-y-auto">
                {tacticOptions.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    className="cursor-pointer hover:bg-gray-100 rounded-md p-2 text-left"
                    onClick={() => {
                      setSelected(t);
                      setArgs([]);
                      setStep("config");
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="text-sm font-bold">Lemmas</div>
              <div className="max-h-40 overflow-y-auto">
                {lemmaOptions.map((l) => (
                  <button
                    type="button"
                    key={l.id}
                    className={classNames(
                      "cursor-pointer hover:bg-gray-100 rounded-md p-2 text-left",
                    )}
                    onClick={() => {
                      setArgs([]);
                      setSelected(l);
                      setStep("config");
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "config" && selected && (
            <>
              <div>Apply {selected.label}</div>
              <div className="text-gray-500">{selected.description}</div>
              <div className="flex flex-col gap-2 py-2">
                {argOptions.map((opt) =>
                  opt.id === "expression" ? (
                    <div className="flex items-center" key={opt.id}>
                      <span>{selected.className}(</span>
                      <Input
                        value={args.length > 0 ? args[0].value : ""}
                        onChange={(e) =>
                          setArgs([
                            {
                              label: e.target.value,
                              value: e.target.value,
                              id: e.target.value,
                            },
                          ])
                        }
                        className="mx-2"
                        placeholder={selected.placeholder || "x >= z"}
                      />
                      <span>)</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() =>
                        setArgs((prev) =>
                          prev.includes(opt)
                            ? prev.filter((a) => a !== opt)
                            : [opt],
                        )
                      }
                      className={classNames(
                        "cursor-pointer hover:bg-gray-100 rounded-md p-2 text-left",
                        args.includes(opt) && "bg-gray-100",
                      )}
                    >
                      {opt.label}
                    </button>
                  ),
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setStep("select");
                    setSelected(undefined);
                    setArgs([]);
                  }}
                  className="w-full"
                  variant="outline"
                  size="xs"
                >
                  <LatexString latex="<-" /> back
                </Button>
                <Button
                  onClick={() => apply(selected)}
                  disabled={applyTacticDisabled}
                  className="w-full"
                  variant="primary"
                  size="xs"
                >
                  <LatexString latex="+" /> apply
                </Button>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
