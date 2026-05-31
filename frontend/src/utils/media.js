export const resolveMediaUrl = (baseApiUrl, url) => {
  if (!url) return null;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;

  const origin = (baseApiUrl || '').replace(/\/api\/?$/, '') || '';
  const normalizedOrigin = origin.replace(/\/$/, '');
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;

  return `${normalizedOrigin}${normalizedPath}`;
};

export const isPdfUrl = (url) => typeof url === 'string' && /\.pdf($|\?)/i.test(url);

export const getFileNameFromUrl = (url) => {
  if (!url || typeof url !== 'string') return 'file';
  const cleanUrl = url.split('?')[0];
  return cleanUrl.substring(cleanUrl.lastIndexOf('/') + 1) || 'file';
};
