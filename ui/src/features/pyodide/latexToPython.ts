const REPLACEMENTS = [
  {
    regex: /\\lor/g,
    replacement: '|'
  },
  {
    regex: /\\land/g,
    replacement: '&'
  },
  {
    regex: /\\neg/g,
    replacement: '~'
  },
  {
    regex: /\\implies/g,
    replacement: '->'
  },
  {
    regex: /\\iff/g,
    replacement: '<->'
  },
  {
    regex: /\\exists/g,
    replacement: 'exists'
  },
  {
    regex: /\\forall/g,
    replacement: 'forall'
  },
  {
    regex: /\\in/g,
    replacement: 'in'
  },
  {
    regex: /\\cup/g,
    replacement: 'union'
  },
  {
    regex: /\\cap/g,
    replacement: 'intersection'
  },
  
];

export const latexToPython = (latex: string) => {
  let newLatex = latex;
  for (const replacement of REPLACEMENTS) {
    newLatex = newLatex.replace(replacement.regex, replacement.replacement);
  }
  return newLatex;
};
