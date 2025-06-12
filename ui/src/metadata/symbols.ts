// These symbols are replaced with their LaTeX equivalents in rendered node text
export const REPLACABLE_SYMBOLS = [
  {
    name: "|-",
    pattern: "\\|-",
    symbol: "\\vdash",
  },
  {
    name: "<",
    pattern: "<",
    symbol: "\\lt",
  },
  {
    name: ">",
    pattern: ">",
    symbol: "\\gt",
  },
  {
    name: "*",
    pattern: "\\*",
    symbol: "\\:*\\:",
  },
  {
    name: "+",
    pattern: "\\+",
    symbol: "\\:+\\:",
  },
  {
    name: "-",
    pattern: "-",
    symbol: "\\:-",
  },
];
