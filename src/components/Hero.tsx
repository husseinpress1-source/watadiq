import { HERO_IMAGE } from '../data/collections';
import './Hero.scss';

export default function Hero() {
  return (
    <section className="hero">
      <img
        className="hero__image"
        src={HERO_IMAGE}
        alt="Gallery of classical marble sculptures at The Met"
      />
    </section>
  );
}
