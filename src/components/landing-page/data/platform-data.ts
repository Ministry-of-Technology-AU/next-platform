
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
      id: 1,
      title: "",
      subtitle: "",
      description: "",
      image: "/z6ggcs3unvoquykoyupo.webp",
      alt: "Welcome to the Platform!",
      gradient: "",
    },
    {
      id: 2,
      title: "NEEV MEMBER INDUCTIONS OPEN!",
      subtitle: "Spring 2025",
      description: "Forms open till 12th Jan EOD",
      image: "/Neev-Banner.webp",
      alt: "Neev Member Inductions Open!",
      gradient: "dark:bg-black/20",
      buttons: [
        {
          variant: "default",
          children: "Apply Now!",
          onClick: () => window.open("https://linktr.ee/neev.ashoka", "_blank"),
          className: "bg-secondary-light text-green hover:bg-green-light/80 hover:text-secondary-light uppercase font-black",
        }
      ]
    },
    {
      id: 3,
      title: "",
      subtitle: "",
      description: "",
      image: "/xvs8kyobnxkrgzgeym5o.webp",
      alt: "Meet our team!",
      gradient: "",
    },
    {
      id: 4,
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
    },
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