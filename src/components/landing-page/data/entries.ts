import { BannerButton } from "./types";

export const banners: Array<{
  id: number;
  title: string;
  subtitle: string;
  image: string;
  alt: string;
  gradient: string;
  buttons?: BannerButton[];
}> = [
  {
    id: 1,
    title: "Welcome to Platform",
    subtitle: "Your all-in-one university management system",
    image: "https://images.unsplash.com/photo-1660190364603-4d7a4a3ce44c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxMHx8ZGFzaGJvYXJkJTIwdGVjaG5vbG9neSUyMHBsYXRmb3JtJTIwaW50ZXJmYWNlfGVufDB8MHx8Ymx1ZXwxNzU0NDg2NTg3fDA&ixlib=rb-4.1.0&q=85",
    alt: "Modern tech platform dashboard with vibrant colors and clean interface - 2H Media on Unsplash",
    gradient: "from-blue-600/80 to-purple-600/80",
  },
  {
    id: 2,
    title: "Collaborate & Learn",
    subtitle: "Connect with peers and access digital tools seamlessly",
    image: "https://images.unsplash.com/photo-1649769155508-1b5971b6aa50?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxzdHVkZW50cyUyMGNvbGxhYm9yYXRpb24lMjBsYXB0b3BzJTIwd29ya3NwYWNlfGVufDB8MHx8b3JhbmdlfDE3NTQ0ODY1ODd8MA&ixlib=rb-4.1.0&q=85",
    alt: "Students collaborating with laptops and digital tools in modern workspace - Bangun Stock Production on Unsplash",
    gradient: "",
    buttons: [
      { variant: "default", children: "Join Now", onClick: () => alert("Join Now") },
      { variant: "default", children: "Learn More", onClick: () => alert("Learn More") },
    ],
  },
  {
    id: 3,
    title: "Campus Life",
    subtitle: "Discover events, activities, and build your community",
    image: "https://images.unsplash.com/photo-1656615720849-db697d06d820?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxMHx8dW5pdmVyc2l0eSUyMGNhbXB1cyUyMGV2ZW50cyUyMGNvbW11bml0eXxlbnwwfDB8fGdyZWVufDE3NTQ0ODY1ODd8MA&ixlib=rb-4.1.0&q=85",
    alt: "University campus events and activities with vibrant community atmosphere - Meizhi Lang on Unsplash",
    gradient: "from-green-500/80 to-teal-500/80",
    buttons: [
      { variant: "default", children: "View Events", onClick: () => alert("View Events") },
      { variant: "default", children: "Learn More", onClick: () => alert("Learn More") },
    ],
  }
];