import { BannerButton } from "./types";
import { ClipboardPenLine, CalendarSync, WifiPen, Car } from 'lucide-react';

export const banners: Array<{
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  alt: string;
  gradient: string;
  buttons?: BannerButton[];
}> = [
  {
    id: 1,
    title: "Platform Dashboard",
    subtitle: "OUT NOW",
    description: "Access all your university tools and services in one centralized platform",
    image: "https://images.unsplash.com/photo-1660190364603-4d7a4a3ce44c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxMHx8ZGFzaGJvYXJkJTIwdGVjaG5vbG9neSUyMHBsYXRmb3JtJTIwaW50ZXJmYWNlfGVufDB8MHx8Ymx1ZXwxNzU0NDg2NTg3fDA&ixlib=rb-4.1.0&q=85",
    alt: "Modern tech platform dashboard with vibrant colors and clean interface",
    gradient: "from-blue-600/80 to-purple-600/80",
    buttons: [
      { 
        variant: "default", 
        children: "Get Started", 
        className: "bg-white text-black hover:bg-gray-200 font-semibold px-6 py-3",
        onClick: () => window.location.href = "/platform"
      },
      { 
        variant: "ghost", 
        children: "Learn More", 
        className: "text-white border-white hover:bg-white/20 font-medium px-6 py-3",
        onClick: () => window.location.href = "/about"
      }
    ]
  },
  {
    id: 2,
    title: "Course Management",
    subtitle: "FEATURED",
    description: "Plan your semester, review courses, and track your academic progress",
    image: "https://images.unsplash.com/photo-1649769155508-1b5971b6aa50?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxzdHVkZW50cyUyMGNvbGxhYm9yYXRpb24lMjBsYXB0b3BzJTIwd29ya3NwYWNlfGVufDB8MHx8b3JhbmdlfDE3NTQ0ODY1ODd8MA&ixlib=rb-4.1.0&q=85",
    alt: "Students collaborating with laptops and digital tools in modern workspace",
    gradient: "from-emerald-600/80 to-teal-600/80",
    buttons: [
      { 
        variant: "default", 
        children: "View Courses", 
        className: "bg-white text-black hover:bg-gray-200 font-semibold px-6 py-3",
        onClick: () => window.location.href = "/platform/course-reviews"
      },
      { 
        variant: "ghost", 
        children: "Plan Semester", 
        className: "text-white border-white hover:bg-white/20 font-medium px-6 py-3",
        onClick: () => window.location.href = "/platform/semester-planner"
      }
    ]
  },
  {
    id: 3,
    title: "Campus Life",
    subtitle: "DISCOVER",
    description: "Find events, book transportation, and connect with your campus community",
    image: "https://images.unsplash.com/photo-1656615720849-db697d06d820?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxMHx8dW5pdmVyc2l0eSUyMGNhbXB1cyUyMGV2ZW50cyUyMGNvbW11bml0eXxlbnwwfDB8fGdyZWVufDE3NTQ0ODY1ODd8MA&ixlib=rb-4.1.0&q=85",
    alt: "University campus events and activities with vibrant community atmosphere",
    gradient: "from-orange-500/80 to-red-500/80",
    buttons: [
      { 
        variant: "default", 
        children: "View Events", 
        className: "bg-white text-black hover:bg-gray-200 font-semibold px-6 py-3",
        onClick: () => window.location.href = "/platform/events-calendar"
      },
      { 
        variant: "ghost", 
        children: "Book Transport", 
        className: "text-white border-white hover:bg-white/20 font-medium px-6 py-3",
        onClick: () => window.location.href = "/platform/pool-cab"
      }
    ]
  }
];

export const recentlyVisited = [
  {
    id: 1,
    name: "Course Reviews",
    icon: ClipboardPenLine,
    href: "/platform/course-reviews",
    lastVisited: new Date('2024-10-05'),
  },
  {
    id: 2,
    name: "Events Calendar",
    icon: CalendarSync,
    href: "/platform/events-calendar",
    lastVisited: new Date('2024-10-04'),
  },
  {
    id: 3,
    name: "Pool Cab",
    icon: Car,
    href: "/platform/pool-cab",
    lastVisited: new Date('2024-10-03'),
  },
  {
    id: 4,
    name: "WiFi Tickets",
    icon: WifiPen,
    href: "/platform/wifi-tickets",
    lastVisited: new Date('2024-10-02'),
  },
];