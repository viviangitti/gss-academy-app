import { useEffect, useState } from 'react';
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
import History from './pages/History';
import Privacy from './pages/Privacy';
import Install from './pages/Install';
import Feedback from './pages/Feedback';
import Sales from './pages/Sales';
import AICoach from './pages/AICoach';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getRemoteProfile, saveRemoteProfile } from './services/firestore/profile';
import { loadData, saveData, KEYS } from './services/storage';
import type { UserProfile } from './types';
import './App.css';

function AppContent() {
  const { user, loading, firebaseEnabled } = useAuth();
  const [profileReady, setProfileReady] = useState(!firebaseEnabled);
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('gss_onboarding_done')
  );

  // Quando usuário loga, garantimos que o perfil local reflete o remoto
  useEffect(() => {
    if (!firebaseEnabled) {
      setProfileReady(true);
      return;
    }
    if (!user) {
      setProfileReady(true);
      return;
    }
    (async () => {
      const remote = await getRemoteProfile(user.uid);
      if (remote) {
        saveData(KEYS.PROFILE, remote);
      } else {
        // Primeiro login: usa perfil local (se existir) e salva remoto
        const local = loadData<UserProfile>(KEYS.PROFILE, {
          name: user.displayName || '',
          role: '',
          company: '',
          segment: '',
          monthlyGoal: 0,
        });
        const merged: UserProfile = {
          ...local,
          name: local.name || user.displayName || '',
          email: user.email || '',
          uid: user.uid,
          createdAt: Date.now(),
        };
        await saveRemoteProfile(user.uid, merged);
        saveData(KEYS.PROFILE, merged);
      }
      setProfileReady(true);
    })();
  }, [user, firebaseEnabled]);

  if (loading || !profileReady) {
    return (
      <div className="app-loading">
        <div className="app-loading-logo">M</div>
      </div>
    );
  }

  // Se Firebase está ativo e não há usuário logado → tela de auth
  if (firebaseEnabled && !user) {
    return <Auth />;
  }

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
            <Route path="/historico" element={<History />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/instalar" element={<Install />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/vendas" element={<Sales />} />
            <Route path="/ia-coach" element={<AICoach />} />
            <Route path="/perfil" element={<Profile />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
