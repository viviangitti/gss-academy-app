import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Onboarding from './components/Onboarding';
import Home from './pages/Home';
import Library from './pages/Library';
import TrainingHub from './pages/TrainingHub';
import Objections from './pages/Objections';
import Scripts from './pages/Scripts';
import Techniques from './pages/Techniques';
import News from './pages/News';
import Favorites from './pages/Favorites';
import RolePlay from './pages/RolePlay';
import PreMeeting from './pages/PreMeeting';
import MessageCoach from './pages/MessageCoach';
import MeetingAnalysis from './pages/MeetingAnalysis';
import ClientResearch from './pages/ClientResearch';
import AICoach from './pages/AICoach';
import Profile from './pages/Profile';
import './App.css';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('gss_onboarding_done')
  );

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/biblioteca" element={<Library />} />
            <Route path="/objecoes" element={<Objections />} />
            <Route path="/scripts" element={<Scripts />} />
            <Route path="/tecnicas" element={<Techniques />} />
            <Route path="/noticias" element={<News />} />
            <Route path="/favoritos" element={<Favorites />} />
            <Route path="/treino-hub" element={<TrainingHub />} />
            <Route path="/treino" element={<RolePlay />} />
            <Route path="/pre-reuniao" element={<PreMeeting />} />
            <Route path="/coach-mensagem" element={<MessageCoach />} />
            <Route path="/analise-reuniao" element={<MeetingAnalysis />} />
            <Route path="/cliente-pesquisa" element={<ClientResearch />} />
            <Route path="/ia-coach" element={<AICoach />} />
            <Route path="/perfil" element={<Profile />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
