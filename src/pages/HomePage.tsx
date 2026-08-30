import Header from '../components/Header';
import Footer from '../components/Footer';
import HomeHero from '../components/HomeHero';
import HomeIntroBanner from '../components/HomeIntroBanner';
import PromoSections from '../components/PromoSections';
import { useLegacyPlugins } from '../lib/plugins';
import './HomePage.scss';

export default function HomePage() {
  useLegacyPlugins();

  return (
    <div className="home-page">
      <Header />
      <HomeHero />
      <HomeIntroBanner />
      <PromoSections />
      <Footer />
    </div>
  );
}
