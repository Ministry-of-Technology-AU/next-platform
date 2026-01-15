
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