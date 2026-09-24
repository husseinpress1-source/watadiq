export async function sendWelcomeEmail(env, { to, name }) {
  const key = env.RESEND_API_KEY;
  if (!key) {
    console.warn('RESEND_API_KEY not set — skipping welcome email');
    return { skipped: true };
  }

  const from = env.RESEND_FROM || 'WATAD Software <onboarding@resend.dev>';
  const subject = 'Welcome to WATAD ONE';
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h1 style="color:#e4002b;font-size:22px">Welcome, ${escapeHtml(name)}</h1>
      <p style="color:#333;line-height:1.6">Your WATAD ONE account is ready. Sign in anytime at <a href="https://watadiq.com/account/sign-in">watadiq.com/account/sign-in</a> to manage your profile.</p>
      <p style="color:#888;font-size:13px">WATAD Software · watadiq.com</p>
    </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Resend error', res.status, text);
    return { ok: false };
  }
  return { ok: true };
}

export async function sendPasswordResetEmail(env, { to, code }) {
  const key = env.RESEND_API_KEY;
  if (!key) {
    console.warn('RESEND_API_KEY not set — cannot send reset email');
    return { ok: false, skipped: true };
  }

  const from = env.RESEND_FROM || 'WATAD Software <onboarding@resend.dev>';
  const subject = 'Your WATAD password reset code';
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
      <p style="color:#e4002b;font-weight:700;font-size:14px;letter-spacing:0.06em;text-transform:uppercase">WATAD Software</p>
      <h1 style="color:#101010;font-size:22px;margin:16px 0 8px">Reset your password</h1>
      <p style="color:#444;line-height:1.6">Use this one-time code on watadiq.com. It expires in 15 minutes.</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:0.35em;color:#101010;margin:28px 0;padding:16px 20px;background:#f5f5f5;border-radius:12px;text-align:center">${escapeHtml(code)}</p>
      <p style="color:#888;font-size:13px;line-height:1.5">If you did not request this, you can ignore this email. Your password will stay the same.</p>
    </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    console.error('Resend reset error', res.status, await res.text());
    return { ok: false };
  }
  return { ok: true };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
