export interface TechStackItem {
  name: string;
  icon: string;
}

const DEVICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';

/** Ordered for pyramid: apex first, then each row left-to-right */
export const TECH_STACK: TechStackItem[] = [
  { name: 'WATAD', icon: '/images/watad-logo-red.png' },
  { name: 'React', icon: `${DEVICON}/react/react-original.svg` },
  { name: 'GitHub', icon: `${DEVICON}/github/github-original.svg` },
  { name: 'Node.js', icon: `${DEVICON}/nodejs/nodejs-original.svg` },
  { name: 'TypeScript', icon: `${DEVICON}/typescript/typescript-original.svg` },
  { name: 'Next.js', icon: `${DEVICON}/nextjs/nextjs-original.svg` },
  { name: 'Python', icon: `${DEVICON}/python/python-original.svg` },
  { name: 'Docker', icon: `${DEVICON}/docker/docker-original.svg` },
  { name: 'PostgreSQL', icon: `${DEVICON}/postgresql/postgresql-original.svg` },
  { name: 'MongoDB', icon: `${DEVICON}/mongodb/mongodb-original.svg` },
  { name: 'AWS', icon: `${DEVICON}/amazonwebservices/amazonwebservices-plain-wordmark.svg` },
  { name: 'Vue.js', icon: `${DEVICON}/vuejs/vuejs-original.svg` },
  { name: 'Flutter', icon: `${DEVICON}/flutter/flutter-original.svg` },
  { name: 'GraphQL', icon: `${DEVICON}/graphql/graphql-plain.svg` },
  { name: 'Redis', icon: `${DEVICON}/redis/redis-original.svg` },
  { name: 'Kubernetes', icon: `${DEVICON}/kubernetes/kubernetes-plain.svg` },
  { name: 'JavaScript', icon: `${DEVICON}/javascript/javascript-original.svg` },
  { name: 'Java', icon: `${DEVICON}/java/java-original.svg` },
  { name: 'PHP', icon: `${DEVICON}/php/php-original.svg` },
  { name: 'Laravel', icon: `${DEVICON}/laravel/laravel-original.svg` },
  { name: 'MySQL', icon: `${DEVICON}/mysql/mysql-original.svg` },
  { name: 'Firebase', icon: `${DEVICON}/firebase/firebase-plain.svg` },
  { name: 'Swift', icon: `${DEVICON}/swift/swift-original.svg` },
  { name: 'Kotlin', icon: `${DEVICON}/kotlin/kotlin-original.svg` },
  { name: 'Android', icon: `${DEVICON}/android/android-original.svg` },
  { name: 'Angular', icon: `${DEVICON}/angularjs/angularjs-original.svg` },
  { name: 'Git', icon: `${DEVICON}/git/git-original.svg` },
  { name: 'Nginx', icon: `${DEVICON}/nginx/nginx-original.svg` },
  { name: 'Linux', icon: `${DEVICON}/linux/linux-original.svg` },
  { name: 'Figma', icon: `${DEVICON}/figma/figma-original.svg` },
  { name: 'HTML5', icon: `${DEVICON}/html5/html5-original.svg` },
  { name: 'CSS3', icon: `${DEVICON}/css3/css3-original.svg` },
  { name: 'Sass', icon: `${DEVICON}/sass/sass-original.svg` },
];

export const PYRAMID_ROW_COUNTS = [1, 3, 5, 7, 9, 7] as const;

export function buildPyramidRows(items: TechStackItem[]): TechStackItem[][] {
  const rows: TechStackItem[][] = [];
  let offset = 0;

  for (const count of PYRAMID_ROW_COUNTS) {
    rows.push(items.slice(offset, offset + count));
    offset += count;
  }

  return rows;
}
