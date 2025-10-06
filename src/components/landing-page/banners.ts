export type BannerButton = {
  type: 'primary' | 'secondary';
  text: string;
  link: string;
};

export type Banner = {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttons: BannerButton[];
};

export const banners: Banner[] = [
  {
    title: 'Demon Rush',
    subtitle: 'OUT NOW',
    description: 'Team up in Demon Rush and crush the incoming swarm of Demons.',
    image: '/globe.svg',
    buttons: [
      { type: 'primary', text: 'Play For Free', link: '/play' },
      { type: 'secondary', text: 'Learn More', link: '/demon-rush' },
    ],
  },
  {
    title: 'Epic Savings',
    subtitle: 'SALE',
    description: 'Save big on top games this season.',
    image: '/next.svg',
    buttons: [
      { type: 'primary', text: 'Shop Now', link: '/shop' },
    ],
  },
  // Add more banners as needed
];