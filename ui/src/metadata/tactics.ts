type TacticOrLemma = {
  id: string;
  label: string;
  description: string;
  className: string;
  arguments: (
    | "variables"
    | "hypotheses"
    | "verbose"
    | "this"
    | "expressions"
  )[];
  placeholder?: string;
  type: "tactic" | "lemma";
};
export type Tactic = TacticOrLemma & {
  type: "tactic";
};
export type Lemma = TacticOrLemma & {
  type: "lemma";
};

export const AVAILABLE_TACTICS: Tactic[] = [
  {
    id: "linear-arithmetic",
    label: "Linear arithmetic",
    description:
      "A tactic to try to establish a goal via linear arithmetic.  Inspired by the linarith tactic in Lean.",
    className: "Linarith",
    arguments: ["verbose"],
    type: "tactic",
  },
  {
    id: "contrapositive",
    label: "Contrapositive",
    description:
      'Contrapose the goal and a hypothesis.  If the hypothesis is a proposition, replace the goal with the negation of the hypothesis, and the hypothesis with the negation of the goal.  If the hypothesis is not a proposition, this becomes a proof by contradiction, adding the negation of the goal as a hypothesis, and "false" as the goal.',
    className: "Contrapose",
    arguments: ["hypotheses", "this"],
    type: "tactic",
  },
  {
    id: "split-hypothesis",
    label: "Split hypothesis",
    description:
      "Split a hypothesis into its conjuncts.  If the hypothesis is a conjunction, split the hypothesis into one hypothesis for each conjunct.  The new hypotheses will be named according to the names supplied in the constructor.",
    className: "SplitHyp",
    arguments: ["hypotheses", "this"],
    type: "tactic",
  },
  {
    id: "cases",
    label: "Cases",
    description:
      "Split a hypothesis into its disjuncts.  If the hypothesis is a disjunction, split the hypothesis into one goal for each disjunct.",
    className: "Cases",
    arguments: ["hypotheses"],
    type: "tactic",
  },
  {
    id: "simplify",
    label: "Simplify",
    description:
      "Simplifies each hypothesis using other hypotheses, then the goal using the hypothesis.",
    className: "SimpAll",
    arguments: [],
    type: "tactic",
  },
  {
    id: "split-goal",
    label: "Split goal",
    description:
      "Split the goal into its conjuncts.  If the goal is a conjunction, split the goal into one goal for each conjunct.",
    className: "SplitGoal",
    arguments: [],
    type: "tactic",
  },
  {
    id: "log-linear-arithmetic",
    label: "Log linear arithmetic",
    description: "A tactic to apply the Theta function to an hypothesis",
    className: "LogLinarith",
    arguments: [],
    type: "tactic",
  },
  {
    id: "claim",
    label: "Claim",
    description:
      "Similar to the `have` tactic in Lean.  Add a subgoal to prove, and then prove the original goal assuming the subgoal.",
    className: "Claim",
    arguments: ["expressions"],
    type: "tactic",
  },
];

export const AVAILABLE_LEMMAS: Lemma[] = [
  {
    id: "am-gm-inequality",
    label: "AM-GM Inequality",
    description: "The arithmetic mean-geometric mean inequality.",
    className: "Amgm",
    arguments: ["expressions"],
    placeholder: "x**2,y**2",
    type: "lemma",
  },
];
