import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LayoutProvider } from './context/LayoutContext';
import { CookieConsentProvider } from './context/CookieConsentContext';
import DocumentMeta from './components/DocumentMeta';
import ScrollToTop from './components/ScrollToTop';
import CookieConsentBanner from './components/CookieConsentBanner';
import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import WatadContentPage from './pages/WatadContentPage';
import WatadPrivacyPage from './pages/WatadPrivacyPage';
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
          <CookieConsentBanner />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<WatadContentPage />} />
            <Route path="/expertise" element={<WatadContentPage />} />
            <Route path="/team" element={<WatadContentPage />} />
            <Route path="/pricing" element={<WatadContentPage />} />
            <Route path="/contact" element={<WatadContentPage />} />
            <Route path="/privacy" element={<WatadPrivacyPage />} />
            <Route path="/work" element={<WorkPage />} />
            <Route path="/live" element={<WatadLivePage />} />
            <Route path="/collection" element={<CollectionPage />} />
          </Routes>
        </CookieConsentProvider>
      </LayoutProvider>
    </BrowserRouter>
  );
}
