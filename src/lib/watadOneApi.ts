export type WatadOneAccount = {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  createdAt: string;
};

const TOKEN_KEY = 'watad_one_token';

export function getWatadOneToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

function authHeaders(): HeadersInit {
  const token = getWatadOneToken();
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function parseAuthResponse(res: Response) {
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    account?: WatadOneAccount;
    token?: string;
  };
  if (!res.ok) throw new Error(data.error || 'generic');
  if (data.token) setToken(data.token);
  return data;
}

export async function watadOneMe(): Promise<WatadOneAccount | null> {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include', headers: authHeaders() });
    if (res.status === 401) {
      setToken(null);
      return null;
    }
    if (!res.ok) return null;
    const data = (await res.json().catch(() => ({}))) as {
      account?: WatadOneAccount;
      token?: string;
    };
    if (data.token) setToken(data.token);
    return data.account ?? null;
  } catch {
    return null;
  }
}

export async function watadOneLogin(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return parseAuthResponse(res);
}

export async function watadOneRegister(fullName: string, email: string, password: string) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, password }),
  });
  return parseAuthResponse(res);
}

export async function requestPasswordReset(email: string) {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || 'generic');
  return data;
}

export async function resetPasswordWithCode(email: string, code: string, password: string) {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      code: code.trim().replace(/\s/g, ''),
      password,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || 'generic');
  return data;
}

export async function watadOneLogout() {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(),
  }).catch(() => undefined);
  setToken(null);
}

export async function adminSaveBlogPost(body: Record<string, unknown>) {
  const res = await fetch('/api/blog/admin/posts', {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || 'generic');
  return data;
}

export async function adminUploadBlogCover(webp: Blob) {
  const res = await fetch('/api/blog/admin/upload', {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...authHeaders(),
      'Content-Type': 'image/webp',
    },
    body: webp,
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string; url?: string };
  if (!res.ok || !data.url) throw new Error(data.error || 'upload-failed');
  return data.url;
}

export async function adminListBlogPosts() {
  const res = await fetch('/api/blog/admin/posts', {
    credentials: 'include',
    headers: authHeaders(),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || 'generic');
  return (data as { posts: unknown[] }).posts;
}

export async function adminFetchBlogPost(slug: string) {
  const res = await fetch(`/api/blog/admin/posts/${encodeURIComponent(slug)}`, {
    credentials: 'include',
    headers: authHeaders(),
    cache: 'no-store',
  });
  const data = (await res.json().catch(() => ({}))) as { post?: unknown; error?: string };
  if (!res.ok || !data.post) throw new Error(data.error || 'generic');
  return data.post;
}

export async function adminDeleteBlogPost(opts: { slug: string; id?: string }) {
  const res = await fetch('/api/blog/admin/post-delete', {
    method: 'POST',
    credentials: 'include',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: opts.id?.trim() || undefined,
      slug: opts.slug.trim().toLowerCase(),
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
  if (!res.ok) throw new Error(data.error || data.message || 'generic');
  return data;
}
