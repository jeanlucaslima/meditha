export interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}

export function generateImageSizes(width: number, height: number): string {
  // Generate responsive sizes string
  return `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${width}px`;
}

export function generateSrcSet(basePath: string, sizes: number[] = [400, 800, 1200, 1600]): string {
  return sizes
    .map(size => `${basePath}?w=${size} ${size}w`)
    .join(', ');
}

export function optimizeImagePath(src: string, width?: number, quality: number = 85): string {
  if (!width) return src;

  // Add query parameters for image optimization
  const url = new URL(src, 'https://example.com');
  url.searchParams.set('w', width.toString());
  url.searchParams.set('q', quality.toString());

  return url.pathname + url.search;
}

export const heroImages = {
  mobile: {
    webp: '/images/hero-mobile.webp',
    avif: '/images/hero-mobile.avif',
    jpg: '/images/hero-mobile.jpg'
  },
  desktop: {
    webp: '/images/hero-desktop.webp',
    avif: '/images/hero-desktop.avif',
    jpg: '/images/hero-desktop.jpg'
  }
};

export const iconImages = {
  moon: '/images/icons/moon.svg',
  heart: '/images/icons/heart.svg',
  clock: '/images/icons/clock.svg',
  checkCircle: '/images/icons/check-circle.svg',
  star: '/images/icons/star.svg',
  chartBar: '/images/icons/chart-bar.svg',
  documentText: '/images/icons/document-text.svg',
  users: '/images/icons/users.svg'
};