import { TECH_STACK } from '../data/tech-stack';
import './TechStackStrip.scss';

const marqueeTrack = [...TECH_STACK, ...TECH_STACK];

export default function TechStackStrip() {
  return (
    <section
      className="tech-stack-strip"
      aria-label="Technologies we work with"
      dir="ltr"
    >
      <div className="tech-stack-strip__fade tech-stack-strip__fade--left" aria-hidden="true" />
      <div className="tech-stack-strip__fade tech-stack-strip__fade--right" aria-hidden="true" />

      <div className="tech-stack-strip__viewport">
        <ul className="tech-stack-strip__track">
          {marqueeTrack.map((tech, index) => (
            <li key={`${tech.name}-${index}`} className="tech-stack-strip__item">
              <img
                className="tech-stack-strip__icon"
                src={tech.icon}
                alt=""
                aria-hidden="true"
                loading="lazy"
                draggable={false}
              />
              <span className="tech-stack-strip__label">{tech.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
