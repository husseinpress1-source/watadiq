import { useEffect, useState } from 'react';
import moment from 'moment';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import Hero from '../components/Hero';
import BrowseArt from '../components/BrowseArt';
import ResearchResources from '../components/ResearchResources';
import Footer from '../components/Footer';
import { fetchCollectionStats } from '../lib/api';
import { useLegacyPlugins } from '../lib/plugins';
import './CollectionPage.scss';

export default function CollectionPage() {
  const [stats, setStats] = useState<{ total: number; updated: string } | null>(null);
  useLegacyPlugins();

  useEffect(() => {
    fetchCollectionStats()
      .then(setStats)
      .catch(() => setStats({ total: 470000, updated: moment().format('YYYY-MM-DD') }));
  }, []);

  return (
    <div className="collection-page">
      <Header />
      <Breadcrumbs />
      <Hero />

      <main className="collection-page__content">
        <section className="intro">
          <h1>The Met Collection</h1>
          <p>
            Travel around the world and across 5,000 years of history through
            {stats ? ` ${stats.total.toLocaleString()} works of art` : ' hundreds of thousands of works of art'} in
            The Met collection. Discover masterpieces from every corner of the globe,
            spanning ancient civilizations to contemporary creations.
          </p>
          {stats && (
            <p className="intro__meta">
              Collection updated {moment(stats.updated).format('MMMM D, YYYY')}
            </p>
          )}
        </section>

        <BrowseArt />
        <ResearchResources />
      </main>

      <Footer />
    </div>
  );
}
