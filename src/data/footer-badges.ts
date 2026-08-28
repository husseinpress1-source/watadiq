export interface FooterSecurityBadge {
  id: string;
  src: string;
  altKey: string;
}

export const FOOTER_SECURITY_BADGES: FooterSecurityBadge[] = [
  { id: 'cloudflare', src: '/assets/footer/security/cloudflare.svg', altKey: 'footer.securityCloudflare' },
  { id: 'google', src: '/assets/footer/security/google.svg', altKey: 'footer.securityGoogleTrust' },
  { id: 'letsencrypt', src: '/assets/footer/security/letsencrypt.png', altKey: 'footer.securityLetsEncrypt' },
  { id: 'digicert', src: '/assets/footer/security/digicert.svg', altKey: 'footer.securityDigiCert' },
  { id: 'sucuri', src: '/assets/footer/security/sucuri.png', altKey: 'footer.securitySucuri' },
  { id: 'aws', src: '/assets/footer/security/aws.svg', altKey: 'footer.securityAws' },
  { id: 'microsoft', src: '/assets/footer/security/microsoft.svg', altKey: 'footer.securityMicrosoft' },
  { id: 'symantec', src: '/assets/footer/security/symantec.svg', altKey: 'footer.securitySymantec' },
  { id: 'fortinet', src: '/assets/footer/security/fortinet.svg', altKey: 'footer.securityFortinet' },
  { id: 'paloalto', src: '/assets/footer/security/paloalto.svg', altKey: 'footer.securityPaloAlto' },
  { id: 'mcafee', src: '/assets/footer/security/mcafee.svg', altKey: 'footer.securityMcAfee' },
  { id: 'owasp', src: '/assets/footer/security/owasp.png', altKey: 'footer.securityOwasp' },
];
