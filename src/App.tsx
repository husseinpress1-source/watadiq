import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LayoutProvider } from './context/LayoutContext';
import { WatadOneProvider } from './context/WatadOneContext';
import { CookieConsentProvider } from './context/CookieConsentContext';
import AppErrorBoundary from './components/AppErrorBoundary';
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
import BlogIndexPage from './pages/BlogIndexPage';
import BlogPostPage from './pages/BlogPostPage';
import WatadAccountSignInPage from './pages/WatadAccountSignInPage';
import WatadAccountForgotPage from './pages/WatadAccountForgotPage';
import WatadAccountResetPage from './pages/WatadAccountResetPage';
import AdminBlogPage from './pages/AdminBlogPage';
import './styles/global.scss';
import './styles/rtl.scss';

export default function App() {
  return (
    <AppErrorBoundary>
    <BrowserRouter>
      <LayoutProvider>
        <WatadOneProvider>
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
            <Route path="/blog" element={<BlogIndexPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/account/sign-in" element={<WatadAccountSignInPage />} />
            <Route path="/account/forgot" element={<WatadAccountForgotPage />} />
            <Route path="/account/reset" element={<WatadAccountResetPage />} />
            <Route path="/admin/blog" element={<AdminBlogPage />} />
            <Route path="/collection" element={<CollectionPage />} />
          </Routes>
        </CookieConsentProvider>
        </WatadOneProvider>
      </LayoutProvider>
    </BrowserRouter>
    </AppErrorBoundary>
  );
}
