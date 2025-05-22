import React from 'react';
import PyodideComponent from './PyodideComponent';
import '../style.css';

function App(): React.ReactElement {
  return (
    <div className="app-container">
      <PyodideComponent />
    </div>
  );
}

export default App;