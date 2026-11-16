import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'JESMA Bouquet',
    short_name: 'JESMA',
    description: 'Katalog Buket Bunga Eksklusif JESMA Bouquet',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF7F2',
    theme_color: '#064E3B',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
