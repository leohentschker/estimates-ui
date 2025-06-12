import classNames from "classnames";
import { useMemo, useState } from "react";
import {
  applyTactic,
  selectAssumptions,
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
type ItemType = "tactic" | "lemma";

export default function TacticPopover({ nodeId }: { nodeId: string }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"select" | "config">("select");
  const [itemType, setItemType] = useState<ItemType>();
  const [selected, setSelected] = useState<Item>();
  const [args, setArgs] = useState<string[]>([]);

  const variables = useAppSelector(selectVariables);
  const hypotheses = useAppSelector(selectAssumptions);
  const dispatch = useAppDispatch();

  const apply = () => {
    if (!selected) return;
    const call = `${selected.className}(${args.join(", ")})`;
    dispatch(
      applyTactic({ nodeId, tactic: call, isLemma: itemType === "lemma" }),
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
    if (itemType !== "tactic" || !selected) return [];
    const tac = selected as Tactic;
    const opts: { label: string; value: string }[] = [];
    if (tac.arguments.includes("variables"))
      opts.push(...variables.map((v) => ({ label: v.name, value: v.name })));
    if (tac.arguments.includes("hypotheses"))
      opts.push(
        ...hypotheses.map((h) => ({
          label: `${h.name}: ${h.input}`,
          value: h.name,
        })),
      );
    if (tac.arguments.includes("verbose"))
      opts.push(
        { label: "verbose=True", value: "verbose=True" },
        { label: "verbose=False", value: "verbose=False" },
      );
    return opts;
  }, [selected, itemType, variables, hypotheses]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button variant="outline" size="xs">
          <LatexString latex="+" /> apply tactic
        </Button>
      </PopoverTrigger>
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
                    className="cursor-pointer hover:bg-gray-100 rounded-md p-2"
                    onClick={() => {
                      setItemType("tactic");

                      if (t.arguments.length === 0) {
                        setSelected(t);
                        apply();
                        return;
                      }

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
                      "cursor-pointer hover:bg-gray-100 rounded-md p-2",
                    )}
                    onClick={() => {
                      setItemType("lemma");
                      setArgs([]);
                      if (l.arguments.length === 0) {
                        setSelected(l);
                        apply();
                        return;
                      }
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
              <div>Arguments for {selected.label}</div>
              <div className="flex flex-col gap-2 py-2">
                {itemType === "tactic" ? (
                  argOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() =>
                        setArgs((prev) =>
                          prev.includes(opt.value)
                            ? prev.filter((a) => a !== opt.value)
                            : [opt.value],
                        )
                      }
                      className={classNames(
                        "cursor-pointer hover:bg-gray-100 rounded-md p-2",
                        args.includes(opt.value) && "bg-gray-100",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))
                ) : (
                  <div className="flex items-center">
                    <span>{selected.className}(</span>
                    <Input
                      value={args[0] || ""}
                      onChange={(e) => setArgs([e.target.value])}
                      className="mx-2"
                      placeholder="x**2,y**2"
                    />
                    <span>)</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setStep("select")}
                  className="w-full"
                  variant="outline"
                  size="xs"
                >
                  <LatexString latex="<-" /> back
                </Button>
                <Button
                  onClick={apply}
                  disabled={args.length === 0 || args[0] === ""}
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
