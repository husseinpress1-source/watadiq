import 'core-js/stable';
import 'lazysizes';
import 'lazysizes/plugins/unveilhooks/ls.unveilhooks';

export async function fetchCollectionStats(): Promise<{ total: number; updated: string }> {
  const response = await fetch('/api/collection-stats.json');
  if (!response.ok) throw new Error('Failed to fetch collection stats');
  return response.json();
}

export async function subscribeNewsletter(email: string): Promise<{ success: boolean }> {
  const response = await fetch('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error('Subscription failed');
  return response.json();
}
