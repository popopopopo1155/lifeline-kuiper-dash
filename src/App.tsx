import { Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import Footer from './components/Footer';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AboutProfile from './pages/AboutProfile';
import ContactPortal from './pages/ContactPortal';
import TermsOfUse from './pages/TermsOfUse';
import JournalArticle from './pages/JournalArticle';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdminProvider } from './contexts/AdminContext';

function App() {
  return (
    <ThemeProvider>
      <AdminProvider>
        <div className="min-h-screen flex flex-col bg-[#0a0a0b]">
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/about" element={<AboutProfile />} />
              <Route path="/contact" element={<ContactPortal />} />
              <Route path="/terms" element={<TermsOfUse />} />
              <Route path="/journal/:id" element={<JournalArticle />} />
            </Routes>
          </main>
        </div>
      </AdminProvider>
    </ThemeProvider>
  );
}

export default App;
