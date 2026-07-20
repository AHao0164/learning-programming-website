const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

export const BACKEND_URL = trimTrailingSlash(
  import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000'
);

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_URL || `${BACKEND_URL}/api/v1`
);

export const SOCKET_URL = trimTrailingSlash(
  import.meta.env.VITE_SOCKET_URL || BACKEND_URL
);

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const resolveAssetUrl = (value, fallback = '') => {
  if (!value) return fallback;

  if (
    /^https?:\/\//i.test(value) ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  ) {
    return value;
  }

  if (value.startsWith('/')) {
    return `${BACKEND_URL}${value}`;
  }

  return value;
};
