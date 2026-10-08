import { useState } from 'react';
import Landing from './pages/Landing';
import Simulator from './pages/Simulator';
import type { UseCase, Industry } from './types';

function App() {
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>('Manufacturing');

  const handleSelect = (useCase: UseCase, industry: Industry) => {
    setSelectedUseCase(useCase);
    setSelectedIndustry(industry);
  };

  if (selectedUseCase) {
    return (
      <Simulator 
        useCase={selectedUseCase} 
        industry={selectedIndustry} 
        onBack={() => setSelectedUseCase(null)} 
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
