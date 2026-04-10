import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Checklists from './pages/Checklists';
import AICoach from './pages/AICoach';
import Profile from './pages/Profile';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calendario" element={<Calendar />} />
            <Route path="/checklists" element={<Checklists />} />
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
