import { isSupabaseConfigured } from './supabase';

const configuredAppUrl = import.meta.env.VITE_APP_URL?.trim();

function isLocalHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === 'localhost' || host === '::1' || host.endsWith('.localhost')) {
    return true;
  }

  const parts = host.split('.').map(Number);
  if (parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }

  return parts[0] === 10
    || parts[0] === 127
    || (parts[0] === 192 && parts[1] === 168)
    || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
    || (parts[0] === 169 && parts[1] === 254);
}

export function getPublicAppUrl(): string | null {
  const baseUrl = configuredAppUrl || `${window.location.origin}${window.location.pathname}`;

  try {
    const url = new URL(baseUrl);
    if (url.protocol !== 'https:' || isLocalHost(url.hostname)) {
      return null;
    }

    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/+$/, '');
  } catch {
    return null;
  }
}

export function getInvitationUrl(token: string): string | null {
  if (!isSupabaseConfigured) return null;
  const baseUrl = getPublicAppUrl();
  if (!baseUrl) return null;

  const url = new URL(baseUrl);
  url.searchParams.set('token', token);
  return url.toString();
}
