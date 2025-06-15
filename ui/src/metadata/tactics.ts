export type Tactic = {
  id: string;
  label: string;
  description: string;
  className: string;
  arguments: ("variables" | "hypotheses" | "goal" | "verbose")[];
};
export const AVAILABLE_TACTICS: Tactic[] = [
  {
    id: "linear-arithmetic",
    label: "Linear arithmetic",
    description: "Linear arithmetic",
    className: "Linarith",
    arguments: ["verbose"],
  },
  {
    id: "contrapositive",
    label: "Contrapositive",
    description: "Contrapositive",
    className: "Contrapose",
    arguments: ["hypotheses", "goal"],
  },
  {
    id: "split-hypothesis",
    label: "Split hypothesis",
    description: "Split hypothesis",
    className: "SplitHyp",
    arguments: ["hypotheses", "goal"],
  },
  {
    id: "cases",
    label: "Cases",
    description: "Cases",
    className: "Cases",
    arguments: ["hypotheses"],
  },
  {
    id: "simplify",
    label: "Simplify",
    description: "Simplify",
    className: "SimpAll",
    arguments: [],
  },
  {
    id: "split-goal",
    label: "Split goal",
    description: "Split goal",
    className: "SplitGoal",
    arguments: [],
  },
  {
    id: "log-linear-arithmetic",
    label: "Log linear arithmetic",
    description: "Log linear arithmetic",
    className: "LogLinarith",
    arguments: [],
  },
];

export type Lemma = {
  id: string;
  label: string;
  description: string;
  className: string;
  arguments: ("expressions" | "variables" | "hypotheses")[];
};
export const AVAILABLE_LEMMAS: Lemma[] = [
  {
    id: "am-gm-inequality",
    label: "AM-GM Inequality",
    description: "AM-GM Inequality",
    className: "Amgm",
    arguments: ["expressions"],
  },
];
