import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/ui/Layout';
import Intro from './pages/Intro';
import Overview from './pages/Overview';
import Inbox from './pages/Inbox';
import Contacts from './pages/Contacts';
import Leads from './pages/Leads';
import Automations from './pages/Automations';
import CalendarPage from './pages/Calendar';
import KnowledgeBase from './pages/KnowledgeBase';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Templates from './pages/Templates';
import Settings from './pages/Settings';

function App() {
  const [launched, setLaunched] = useState(false);

  if (!launched) {
    return <Intro onLaunch={() => setLaunched(true)} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="leads" element={<Leads />} />
          <Route path="automations" element={<Automations />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="knowledge-base" element={<KnowledgeBase />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="templates" element={<Templates />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
