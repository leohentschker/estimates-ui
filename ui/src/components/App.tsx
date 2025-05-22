import React from 'react';
import Estimates from './Estimates';
import '../style.css';

function App(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gray-50">
      <Estimates />
    </div>
  );
}

export default App;