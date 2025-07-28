import type { Event, Organization } from "../types/calendar";

export const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Tech Talk: AI in Web Development",
    date: "2024-01-15",
    time: "14:00",
    venue: "Auditorium A",
    organizingBody: "Computer Science Club",
    description:
      "Join us for an insightful discussion on how AI is transforming web development practices.",
    category: "clubs",
    organization: "computer-science-club",
  },
  {
    id: "2",
    title: "Cultural Night 2024",
    date: "2024-01-18",
    time: "18:00",
    venue: "Main Hall",
    organizingBody: "Cultural Society",
    description: "Experience diverse cultures through music, dance, and food.",
    category: "societies",
    organization: "cultural-society",
  },
  {
    id: "3",
    title: "Research Symposium",
    date: "2024-01-20",
    time: "09:00",
    venue: "Conference Room",
    organizingBody: "Engineering Department",
    description: "Annual research presentations by faculty and students.",
    category: "departments",
    organization: "engineering-department",
  },
  {
    id: "4",
    title: "Innovation Workshop",
    date: "2024-01-15",
    time: "16:00",
    venue: "Lab 101",
    organizingBody: "Ministry of Technology",
    description: "Hands-on workshop on emerging technologies and innovation.",
    category: "ministries",
    organization: "ministry-of-technology",
  },
  {
    id: "5",
    title: "Hackathon 2025",
    date: "2025-01-25",
    time: "09:00",
    venue: "Tech Hub",
    organizingBody: "Computer Science Club",
    description: "48-hour coding competition with amazing prizes.",
    category: "clubs",
    organization: "computer-science-club",
  },
  {
    id: "6",
    title: "Art Exhibition Opening",
    date: "2025-01-28",
    time: "17:00",
    venue: "Gallery Space",
    organizingBody: "Cultural Society",
    description: "Showcasing student artwork from various disciplines.",
    category: "societies",
    organization: "cultural-society",
  },
  {
    id: "7",
    title: "Career Fair",
    date: "2025-02-05",
    time: "10:00",
    venue: "Main Auditorium",
    organizingBody: "Engineering Department",
    description: "Meet with top employers and explore career opportunities.",
    category: "departments",
    organization: "engineering-department",
  },
  {
    id: "8",
    title: "Startup Pitch Competition",
    date: "2025-02-10",
    time: "14:00",
    venue: "Innovation Center",
    organizingBody: "Ministry of Technology",
    description:
      "Present your startup ideas to industry experts and investors.",
    category: "ministries",
    organization: "ministry-of-technology",
  },
  // July 27th, 2025 events
  {
    id: "9",
    title: "Morning Yoga Session",
    date: "2025-07-27",
    time: "07:00",
    venue: "Campus Garden",
    organizingBody: "Wellness Club",
    description: "Start your day with a refreshing yoga session in nature.",
    category: "clubs",
    organization: "wellness-club",
  },
  {
    id: "10",
    title: "Tech Innovation Summit",
    date: "2025-07-27",
    time: "10:00",
    venue: "Main Auditorium",
    organizingBody: "Ministry of Technology",
    description:
      "Annual summit featuring the latest in technology and innovation.",
    category: "ministries",
    organization: "ministry-of-technology",
  },
  {
    id: "11",
    title: "Summer Music Festival",
    date: "2025-07-27",
    time: "19:00",
    venue: "Outdoor Stage",
    organizingBody: "Cultural Society",
    description: "An evening of live music performances by student bands.",
    category: "societies",
    organization: "cultural-society",
  },
];

export const organizations: Organization[] = [
  {
    id: "computer-science-club",
    name: "Computer Science Club",
    category: "clubs",
  },
  { id: "robotics-club", name: "Robotics Club", category: "clubs" },
  { id: "wellness-club", name: "Wellness Club", category: "clubs" },
  { id: "cultural-society", name: "Cultural Society", category: "societies" },
  { id: "debate-society", name: "Debate Society", category: "societies" },
  {
    id: "engineering-department",
    name: "Engineering Department",
    category: "departments",
  },
  {
    id: "science-department",
    name: "Science Department",
    category: "departments",
  },
  {
    id: "ministry-of-technology",
    name: "Ministry of Technology",
    category: "ministries",
  },
  {
    id: "ministry-of-education",
    name: "Ministry of Education",
    category: "ministries",
  },
];

export const defaultColors = [
  "#87281B",
  "#60150A",
  "#3B0800", // Primary reds
  "#FFCD74",
  "#F4B448",
  "#D68E3A", // Yellows
  "#519872",
  "#2B6948",
  "#1B3022", // Greens
  "#0267C1",
  "#154A7B",
  "#1C3144", // Blues
  "#767371",
  "#57504C",
  "#1C1917", // Neutrals
];
