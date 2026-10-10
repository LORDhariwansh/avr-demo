import { useState } from 'react';
import Landing from './pages/Landing';
import Simulator from './pages/Simulator';
import type { Industry } from './types';

function App() {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>('Healthcare');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  const handleSelect = (industry: Industry, scenarioId: string) => {
    setSelectedIndustry(industry);
    setSelectedScenarioId(scenarioId);
  };

  if (selectedScenarioId) {
    return (
      <Simulator 
        industry={selectedIndustry} 
        scenarioId={selectedScenarioId}
        onBack={() => setSelectedScenarioId(null)} 
        onIndustryChange={(newIndustry) => setSelectedIndustry(newIndustry)}
      />
    );
  }

  return (
    <Landing 
      onSelect={handleSelect} 
      selectedIndustry={selectedIndustry}
      setIndustry={setSelectedIndustry}
    />
  );
}

export default App;
