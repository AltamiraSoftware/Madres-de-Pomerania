export function resolveEmailUrl(url: string | null | undefined): string | null {
    if (!url) return null;
  
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
  
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  
    if (!appUrl) {
      return url;
    }
  
    const base = appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;
    const path = url.startsWith("/") ? url : `/${url}`;
  
    return `${base}${path}`;
  }