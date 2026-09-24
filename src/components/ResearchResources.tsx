import { researchResources } from '../data/collections';
import './ResearchResources.scss';

export default function ResearchResources() {
  return (
    <section className="research" id="research">
      <h2 className="research__title">Collection Research and Resources</h2>

      <div className="research__grid">
        {researchResources.map((resource) => (
          <a key={resource.id} href={resource.href} className="research__card">
            <span className="research__card-title">{resource.title}</span>
            <span className="research__card-arrow" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5l8 7-8 7V5z" />
              </svg>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
