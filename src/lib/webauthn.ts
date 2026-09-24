function b64urlToBuf(s: string): ArrayBuffer {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

function bufToB64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function webauthnSupported(): boolean {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function createPasskey(options: any): Promise<any> {
  const publicKey: PublicKeyCredentialCreationOptions = {
    ...options,
    challenge: b64urlToBuf(options.challenge),
    user: { ...options.user, id: b64urlToBuf(options.user.id) },
    excludeCredentials: (options.excludeCredentials ?? []).map((c: any) => ({
      ...c,
      id: b64urlToBuf(c.id),
    })),
  };
  const cred = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential;
  if (!cred) throw new Error('cancelled');
  const resp = cred.response as AuthenticatorAttestationResponse;
  return {
    id: cred.id,
    rawId: bufToB64url(cred.rawId),
    type: cred.type,
    response: {
      attestationObject: bufToB64url(resp.attestationObject),
      clientDataJSON: bufToB64url(resp.clientDataJSON),
    },
  };
}

export async function getAssertion(
  options: Record<string, unknown>,
  opts?: { mediation?: CredentialMediationRequirement },
): Promise<Record<string, unknown>> {
  const allowCredentials = Array.isArray(options.allowCredentials)
    ? (options.allowCredentials as Array<{ id: string; type?: PublicKeyCredentialType; transports?: AuthenticatorTransport[] }>).map((c) => ({
        type: (c.type ?? 'public-key') as PublicKeyCredentialType,
        id: b64urlToBuf(c.id),
        transports: c.transports,
      }))
    : undefined;

  const publicKey = {
    ...options,
    challenge: b64urlToBuf(options.challenge as string),
    allowCredentials,
  } as PublicKeyCredentialRequestOptions;

  const cred = (await navigator.credentials.get({
    publicKey,
    mediation: opts?.mediation ?? 'optional',
  })) as PublicKeyCredential | null;
  if (!cred) throw new Error('cancelled');
  const resp = cred.response as AuthenticatorAssertionResponse;
  return {
    id: cred.id,
    rawId: bufToB64url(cred.rawId),
    type: cred.type,
    response: {
      authenticatorData: bufToB64url(resp.authenticatorData),
      clientDataJSON: bufToB64url(resp.clientDataJSON),
      signature: bufToB64url(resp.signature),
      userHandle: resp.userHandle ? bufToB64url(resp.userHandle) : null,
    },
  };
}
