import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LayoutProvider } from './context/LayoutContext';
import { CookieConsentProvider } from './context/CookieConsentContext';
import { WatadAuthProvider } from './context/WatadAuthContext';
import DocumentMeta from './components/DocumentMeta';
import ScrollToTop from './components/ScrollToTop';
import WatadSignInModal from './components/WatadSignInModal';
import CookieConsentBanner from './components/CookieConsentBanner';
import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import WatadPassLandingPage from './pages/pass/WatadPassLandingPage';
import WatadPassLoginPage from './pages/pass/WatadPassLoginPage';
import WatadPassAccountPage from './pages/pass/WatadPassAccountPage';
import WatadPassDevelopersPage from './pages/pass/WatadPassDevelopersPage';
import WatadPassIntegrationGuidePage from './pages/pass/WatadPassIntegrationGuidePage';
import WatadPassConsolePage from './pages/pass/WatadPassConsolePage';
import WatadPassConsoleAppPage from './pages/pass/WatadPassConsoleAppPage';
import WatadPassOAuthCallbackPage from './pages/pass/WatadPassOAuthCallbackPage';
import WatadPassSignInPopupPage from './pages/pass/WatadPassSignInPopupPage';
import WatadPassConsentPage from './pages/pass/WatadPassConsentPage';
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
          <WatadAuthProvider>
            <ScrollToTop />
            <DocumentMeta />
            <WatadSignInModal />
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
              <Route path="/pass" element={<WatadPassLandingPage />} />
              <Route path="/pass/login" element={<WatadPassLoginPage />} />
              <Route path="/pass/account" element={<WatadPassAccountPage />} />
              <Route path="/pass/developers" element={<WatadPassDevelopersPage />} />
              <Route path="/pass/developers/guide" element={<WatadPassIntegrationGuidePage />} />
              <Route path="/pass/oauth/callback" element={<WatadPassOAuthCallbackPage />} />
              <Route path="/pass/console/:orgSlug/apps/:appId" element={<WatadPassConsoleAppPage />} />
              <Route path="/pass/console" element={<WatadPassConsolePage />} />
              <Route path="/pass/signin" element={<WatadPassSignInPopupPage />} />
              <Route path="/pass/consent" element={<WatadPassConsentPage />} />
              {/* OAuth redirects from identity server (WEB_URL=https://watadiq.com) */}
              <Route path="/login" element={<WatadPassLoginPage />} />
              <Route path="/consent" element={<WatadPassConsentPage />} />
            </Routes>
          </WatadAuthProvider>
        </CookieConsentProvider>
      </LayoutProvider>
    </BrowserRouter>
  );
}
