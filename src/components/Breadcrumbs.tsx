import './Breadcrumbs.scss';

export default function Breadcrumbs() {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li>
          <a href="/" aria-label="Home">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
            </svg>
          </a>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <span aria-current="page">The Met Collection</span>
        </li>
      </ol>
    </nav>
  );
}
