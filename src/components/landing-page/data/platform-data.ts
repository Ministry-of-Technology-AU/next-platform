
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
      title: "Course Trajectory Planner Launched!",
      subtitle: "New Feature!",
      description: "We just launched the beta version of a new feature!",
      image: "/yyh4iiocug5dnctfkd5t.webp",
      alt: "Welcome to the Platform!",
      gradient: "",
      buttons: [
        {
          variant: "animatedGhost",
          children: "Check it out!",
          onClick: () => window.location.href = "sg.ashoka.edu.in/platform/trajectory-planner",
          className: "hover:underline text-secondary",
        }
      ]
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
      title: "MoT Inductions for Spring 2025!",
      subtitle: "INDUCTIONS OPEN!",
      description: "Deputy HOD Inductions and member inductions for Marketing Department are open!",
      image: "/yyh4iiocug5dnctfkd5t.webp",
      alt: "Deputy HOD Inductions and Member inductions for Marketing Department are open!",
      gradient: "",
      buttons: [
        {
          variant: "default",
          children: "Events Team Applications",
          onClick: () => window.open("https://forms.gle/haZ5pzDX56MNxuah7", "_blank"),
          className: "bg-secondary-extradark font-black",
        },
        {
          variant: "default",
          children: "Marketing Team Applications",
          onClick: () => window.open("https://forms.gle/vmQu8BtpSwbcam1U7", "_blank"),
          className: "bg-secondary-extradark font-black",
        }
      ]
    },
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