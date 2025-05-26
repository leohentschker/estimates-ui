# Estimates UI
To run a local version of the site run:
```
cd ui
npm run install
npm run dev
```
This is a react site written in Typescript, styled with Tailwind built using [Vite](https://vite.dev).

## Editor
Uses the [Ace Editor](https://www.npmjs.com/package/react-ace) to expose a lightweight browser-based code editor [`src/components/Editor/index.tsx`](src/components/Editor/index.tsx)

## Tutorial
Embedded into the `Editor` component, users can open and close a tutorial bar that explains how to walk through the project.

## Output
Calls `pyodide` and visualizes the terminal output results, similar to what you would see in regular terminal.

## CI/CD
Right now the site is deployed via GitHub pages to [math.llm.dev](https://math.llm.dev). See the full build pipeline [here](.github/workflows/pages.yml).
