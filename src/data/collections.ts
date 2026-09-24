export interface CollectionItem {
  id: string;
  title: string;
  image: string;
  slug: string;
}

export interface ResourceLink {
  id: string;
  title: string;
  href: string;
  image?: string;
}

export const collections: CollectionItem[] = [
  {
    id: '1',
    title: 'African Art in The Michael C. Rockefeller Wing',
    image: '/images/collections/01-african.jpg',
    slug: 'african-art',
  },
  {
    id: '2',
    title: 'The American Wing',
    image: '/images/collections/02-american.jpg',
    slug: 'american-wing',
  },
  {
    id: '3',
    title: 'Ancient American Art in The Michael C. Rockefeller Wing',
    image: '/images/collections/03-ancient-american.jpg',
    slug: 'ancient-american',
  },
  {
    id: '4',
    title: 'Ancient West Asian Art',
    image: '/images/collections/04-west-asian.jpg',
    slug: 'ancient-west-asian',
  },
  {
    id: '5',
    title: 'Arms and Armor',
    image: '/images/collections/05-arms.jpg',
    slug: 'arms-armor',
  },
  {
    id: '6',
    title: 'Asian Art',
    image: '/images/collections/06-asian.jpg',
    slug: 'asian-art',
  },
  {
    id: '7',
    title: 'The Costume Institute',
    image: '/images/collections/07-costume.jpg',
    slug: 'costume-institute',
  },
  {
    id: '8',
    title: 'Drawings and Prints',
    image: '/images/collections/08-drawings.jpg',
    slug: 'drawings-prints',
  },
  {
    id: '9',
    title: 'Egyptian Art',
    image: '/images/collections/09-egyptian.jpg',
    slug: 'egyptian-art',
  },
  {
    id: '10',
    title: 'European Paintings',
    image: '/images/collections/10-european-paintings.jpg',
    slug: 'european-paintings',
  },
  {
    id: '11',
    title: 'European Sculpture and Decorative Arts',
    image: '/images/collections/11-european-sculpture.jpg',
    slug: 'european-sculpture',
  },
  {
    id: '12',
    title: 'Greek and Roman Art',
    image: '/images/collections/12-greek-roman.jpg',
    slug: 'greek-roman',
  },
  {
    id: '13',
    title: 'Islamic Art',
    image: '/images/collections/13-islamic.jpg',
    slug: 'islamic-art',
  },
  {
    id: '14',
    title: 'The Robert Lehman Collection',
    image: '/images/collections/14-lehman.jpg',
    slug: 'lehman-collection',
  },
  {
    id: '15',
    title: 'Thomas J. Watson Library',
    image: '/images/collections/15-library.jpg',
    slug: 'watson-library',
  },
];

export const researchResources: ResourceLink[] = [
  {
    id: '1',
    title: 'Conservation and Scientific Research',
    href: '#conservation',
    image: '/images/collections/08-drawings.jpg',
  },
  {
    id: '2',
    title: 'Libraries and Research Centers',
    href: '#libraries',
    image: '/images/collections/15-library.jpg',
  },
  {
    id: '3',
    title: 'Provenance Research at The Met',
    href: '#provenance',
    image: '/images/collections/09-egyptian.jpg',
  },
  {
    id: '4',
    title: 'Research Guides',
    href: '#guides',
    image: '/images/collections/10-european-paintings.jpg',
  },
  {
    id: '5',
    title: 'MetPublications',
    href: '#publications',
    image: '/images/collections/02-american.jpg',
  },
  {
    id: '6',
    title: 'The Timeline of Art History',
    href: '#timeline',
    image: '/images/collections/12-greek-roman.jpg',
  },
  {
    id: '7',
    title: 'Open Access at The Met',
    href: '#open-access',
    image: '/images/collections/01-african.jpg',
  },
];

export const HERO_IMAGE = '/images/hero.jpg';
