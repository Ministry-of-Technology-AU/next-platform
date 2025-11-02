
import { BannerButton } from "./types";
import { ClipboardPenLine, CalendarSync, Calendar, Award} from 'lucide-react';

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
    title: "Thank you for being part of the early access program!",
    subtitle: "[EARLY ACCESS]",
    description: "Please go through as many pages as you can, test out any feature as you like, and most importantly - make sure to drop your feedback!",
    image: "/yyh4iiocug5dnctfkd5t.webp",
    alt: "Thank you for being part of the early access program! Please go through as many pages as you can, test out any feature as you like, and most importantly - make sure to drop your feedback!",
    gradient: "",
    buttons:[
        {
            variant: "secondary",
            children: "Give Feedback!",
            onClick: () => window.location.href = "https://www.notion.so/ministry-of-technology/2844ae85dc2c80a484bdd94abe7ceecc?v=2844ae85dc2c802a9d79000c2f255fe8&source=copy_link",
        },
        {
            variant: "animatedGhost",
            children: "Visit the old platform",
            onClick: () => window.location.href = "https://sg.ashoka.edu.in/platform",
            className: "hover:underline",
        }
    ]
  },
  {
    id: 3,
    title: "",
    subtitle: "",
    description: "",
    image: "/z6ggcs3unvoquykoyupo.webp",
    alt: "Welcome to the Platform!",
    gradient: "",
  },
  {
    id: 2,
    title: "",
    subtitle: "",
    description: "",
    image: "/xvs8kyobnxkrgzgeym5o.webp",
    alt: "Meet our team!",
    gradient: "",
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