import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LayoutProvider } from './context/LayoutContext';
import { CookieConsentProvider } from './context/CookieConsentContext';
import DocumentMeta from './components/DocumentMeta';
import ScrollToTop from './components/ScrollToTop';
import CookieConsentBanner from './components/CookieConsentBanner';
import ImageProtection from './components/ImageProtection';
import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import WatadContentPage from './pages/WatadContentPage';
import WatadContactPage from './pages/WatadContactPage';
import WatadPrivacyPage from './pages/WatadPrivacyPage';
import WatadTermsPage from './pages/WatadTermsPage';
import WatadSecurityPage from './pages/WatadSecurityPage';
import WorkPage from './pages/WorkPage';
import WatadLivePage from './pages/WatadLivePage';
import './styles/global.scss';
import './styles/rtl.scss';

export default function App() {
  return (
    <BrowserRouter>
      <LayoutProvider>
        <CookieConsentProvider>
          <ScrollToTop />
          <DocumentMeta />
          <ImageProtection />
          <CookieConsentBanner />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<WatadContentPage />} />
            <Route path="/expertise" element={<WatadContentPage />} />
            <Route path="/team" element={<WatadContentPage />} />
            <Route path="/pricing" element={<WatadContentPage />} />
            <Route path="/contact" element={<WatadContactPage />} />
            <Route path="/privacy" element={<WatadPrivacyPage />} />
            <Route path="/terms" element={<WatadTermsPage />} />
            <Route path="/security" element={<WatadSecurityPage />} />
            <Route path="/work" element={<WorkPage />} />
            <Route path="/live" element={<WatadLivePage />} />
            <Route path="/collection" element={<CollectionPage />} />
          </Routes>
        </CookieConsentProvider>
      </LayoutProvider>
    </BrowserRouter>
  );
}
