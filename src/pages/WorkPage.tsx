import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WorkPageHero from '../components/WorkPageHero';
import PortfolioShowcase from '../components/PortfolioShowcase';
import { getWatadPage } from '../i18n/helpers';
import { useLegacyPlugins } from '../lib/plugins';
import './WorkPage.scss';

export default function WorkPage() {
  const { t } = useTranslation();
  const page = getWatadPage(t, 'work');
  useLegacyPlugins();

  if (!page) return null;

  return (
    <div className="work-page">
      <Header />
      <WorkPageHero
        eyebrow={page.eyebrow}
        title={page.title}
        intro={page.intro}
        cta={page.cta}
      />
      <main className="work-page__main">
        <PortfolioShowcase />
      </main>
      <Footer />
    </div>
  );
}
