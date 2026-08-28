/** Google-style popup sign-in — opens WATAD ONE account chooser in a new window. */

const POPUP_MESSAGE = 'watad:signin-success';
const POPUP_OPTS = 'popup=yes,width=480,height=640,menubar=no,toolbar=no,location=yes,status=no,scrollbars=yes,resizable=yes';

export function isSignInPopup(): boolean {
  return new URLSearchParams(window.location.search).get('popup') === '1';
}

export function openWatadSignInPopup(): Window | null {
  const url = `${window.location.origin}/pass/signin?popup=1`;
  const popup = window.open(url, 'watad-signin', POPUP_OPTS);
  popup?.focus();
  return popup;
}

export function finishSignInPopup(): boolean {
  if (!isSignInPopup() || !window.opener) return false;
  window.opener.postMessage({ type: POPUP_MESSAGE }, window.location.origin);
  window.close();
  return true;
}

export function listenForSignInPopup(onSuccess: () => void): () => void {
  const handler = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === POPUP_MESSAGE) onSuccess();
  };
  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}
