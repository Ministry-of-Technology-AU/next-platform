
import { BannerButton } from "./types";
import { ClipboardPenLine, CalendarSync, Calendar, Award } from 'lucide-react';

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
      id: 4,
      title: "",
      subtitle: "",
      description: "",
      image: "/z6ggcs3unvoquykoyupo.webp",
      alt: "Welcome to the Platform!",
      gradient: "",
    },
    {
      id: 5,
      title: "This space is for your advertisements!",
      subtitle: "Dear Organizations:",
      description: "If you want to advertise here, please reach out to us via mail at technology.ministry@ashoka.edu.in",
      image: "/yyh4iiocug5dnctfkd5t.webp",
      alt: "Default Advertisement Banner",
      gradient: "",
      buttons: [
        {
          variant: "animatedGhost",
          children: "Click here to contact Us",
          onClick: () => window.location.href = "mailto:technology.ministry@ashoka.edu.in",
          className: "hover:underline text-secondary",
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
    name: "Semester Planner",
    icon: CalendarSync,
    href: "/platform/semester-planner",
    lastVisited: new Date('2024-10-05'),
  },
  {
    id: 3,
    name: "CGPA Planner",
    icon: Award,
    href: "/platform/cgpa-planner",
    lastVisited: new Date('2024-10-05'),
  },
  {
    id: 4,
    name: "Events Calendar",
    icon: Calendar,
    href: "/platform/events-calendar",
    lastVisited: new Date('2024-10-05'),
  },
];

// Tailwind Safelist to ensure custom colors from Strapi are generated
// This is needed because Tailwind JIT doesn't scan the database for classes
export const tailwindSafelist = [
  // Backgrounds
  'bg-primary', 'bg-primary-light', 'bg-primary-extralight', 'bg-primary-dark', 'bg-primary-extradark', 'bg-primary-bright',
  'bg-secondary', 'bg-secondary-light', 'bg-secondary-extralight', 'bg-secondary-dark', 'bg-secondary-extradark',
  'bg-green', 'bg-green-light', 'bg-green-extralight', 'bg-green-dark', 'bg-green-extradark',
  'bg-blue', 'bg-blue-light', 'bg-blue-extralight', 'bg-blue-dark', 'bg-blue-extradark',
  'bg-gray', 'bg-gray-light', 'bg-gray-extralight', 'bg-gray-dark',
  'bg-black', 'bg-white', 'bg-bg', 'bg-neutral-light',

  // Text Colors
  'text-primary', 'text-primary-light', 'text-primary-extralight', 'text-primary-dark', 'text-primary-extradark', 'text-primary-bright',
  'text-secondary', 'text-secondary-light', 'text-secondary-extralight', 'text-secondary-dark', 'text-secondary-extradark',
  'text-green', 'text-green-light', 'text-green-extralight', 'text-green-dark', 'text-green-extradark',
  'text-blue', 'text-blue-light', 'text-blue-extralight', 'text-blue-dark', 'text-blue-extradark',
  'text-gray', 'text-gray-light', 'text-gray-extralight', 'text-gray-dark',
  'text-black', 'text-white', 'text-bg', 'text-neutral-light',

  // Hover states (if needed)
  'hover:bg-primary', 'hover:bg-primary-dark', 'hover:bg-secondary', 'hover:bg-secondary-extradark',

  // Font weights
  'font-black', 'font-bold', 'font-extrabold', 'font-medium', 'font-semibold'
];