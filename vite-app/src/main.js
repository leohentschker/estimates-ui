import './style.css'
import { loadAndRunPyodide } from './pyodide-loader.js'
import 'async-mutex';

document.querySelector('#app').innerHTML = `
  <div>
    <h1>Z3 Pyodide Proof Assistant Demo</h1>
    <p>Running proof assistant in the browser using Pyodide...</p>
    <div id="output">Loading...</div>
  </div>
`

// Run the Pyodide loader when the page loads
const outputElement = document.querySelector('#output');
loadAndRunPyodide(outputElement);