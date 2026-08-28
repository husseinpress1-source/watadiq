import Header from '../components/Header';
import Footer from '../components/Footer';
import HomeHero from '../components/HomeHero';
import TechStackStrip from '../components/TechStackStrip';
import PromoSections from '../components/PromoSections';
import WatadPassHomeStrip from '../components/WatadPassHomeStrip';
import { useLegacyPlugins } from '../lib/plugins';
import './HomePage.scss';

export default function HomePage() {
  useLegacyPlugins();

  return (
    <div className="home-page">
      <Header />
      <HomeHero />
      <TechStackStrip />
      <WatadPassHomeStrip />
      <PromoSections />
      <Footer />
    </div>
  );
}
