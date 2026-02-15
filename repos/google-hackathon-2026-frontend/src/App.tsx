import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProfileSelection from './pages/ProfileSelection';
import Proposal from './pages/Proposal';
import VideoPreview from './pages/VideoPreview';
import Itinerary from './pages/Itinerary';
import SocialSearch from './pages/SocialSearch';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import { AuthProvider } from './context/AuthContext';
import { TravelProvider } from './context/TravelContext'; // Assuming this exists based on Header.tsx usage

function App() {
  return (
    <Router>
      <TravelProvider>
        <AuthProvider>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="mesh-background"></div>
            <Header />
            <main style={{ flex: 1, paddingBottom: 'var(--spacing-md)' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<ProfileSelection />} />
                <Route path="/proposal" element={<Proposal />} />
                <Route path="/preview" element={<VideoPreview />} />
                <Route path="/itinerary" element={<Itinerary />} />
                <Route path="/social" element={<SocialSearch />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/account" element={<Account />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </TravelProvider>
    </Router>
  );
}

export default App;
