export type OrganisationType =
  | "show all"
  | "inductions open"
  | "ministry"
  | "society"
  | "club"
  | "other"
  | "fests"
  | "collectives";

export interface Organisation {
  id: string;
  name: string;
  category: Exclude<OrganisationType, "show all" | "inductions open">;
  description: string;
  fullDescription: string;
  banner?: string;
  logo?: string;
  inductionsOpen: boolean;
  inductionsDeadline?: string;
  people: string[];
  socialMedia: {
    email?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    website?: string;
  };
}

export const organisations: Organisation[] = [
  {
    id: "1",
    name: "Cultural Society",
    category: "society",
    description:
      "Promoting arts, culture, and creative expression across campus through various events and workshops.",
    fullDescription: `
      <p>The Cultural Society is dedicated to fostering artistic expression and cultural appreciation within our campus community. We organize a wide range of events including art exhibitions, music concerts, dance performances, and literary gatherings.</p>
      
      <p>Our mission is to provide a platform for students to showcase their talents, learn new skills, and connect with like-minded individuals who share a passion for the arts.</p>
      
      <h4>What We Do:</h4>
      <ul>
        <li>Monthly art exhibitions featuring student work</li>
        <li>Weekly music jam sessions</li>
        <li>Dance workshops and performances</li>
        <li>Poetry and literature events</li>
        <li>Cultural festivals and celebrations</li>
      </ul>
    `,
    banner:
      "/placeholder.svg?height=200&width=400&text=Cultural+Society+Banner",
    logo: "/placeholder.svg?height=64&width=64&text=CS",
    inductionsOpen: true,
    inductionsDeadline: "March 15, 2024",
    people: ["Sarah Johnson", "Michael Chen", "Priya Patel", "Alex Rodriguez"],
    socialMedia: {
      email: "cultural@university.edu",
      instagram: "https://instagram.com/culturalsociety",
      facebook: "https://facebook.com/culturalsociety",
      website: "https://culturalsociety.university.edu",
    },
  },
  {
    id: "2",
    name: "Tech Innovation Club",
    category: "club",
    description:
      "Building the future through technology, innovation, and collaborative projects.",
    fullDescription: `
      <p>The Tech Innovation Club brings together passionate students interested in technology, programming, and innovation. We work on cutting-edge projects, organize hackathons, and provide learning opportunities for all skill levels.</p>
      
      <p>Whether you're a beginner or an experienced developer, our club offers something for everyone. Join us to learn, build, and innovate together.</p>
      
      <h4>Activities:</h4>
      <ul>
        <li>Weekly coding workshops</li>
        <li>Monthly hackathons</li>
        <li>Tech talks by industry professionals</li>
        <li>Open source project contributions</li>
        <li>Startup pitch competitions</li>
      </ul>
    `,
    banner: "/placeholder.svg?height=200&width=400&text=Tech+Club+Banner",
    logo: "/MoT logo.png",
    inductionsOpen: false,
    people: ["David Kim", "Emma Watson", "Raj Sharma", "Lisa Zhang"],
    socialMedia: {
      email: "tech@university.edu",
      instagram: "https://instagram.com/techclub",
      twitter: "https://twitter.com/techclub",
      linkedin: "https://linkedin.com/company/techclub",
    },
  },
  {
    id: "3",
    name: "Spring Fest",
    category: "fests",
    description:
      "The biggest cultural festival of the year featuring music, dance, food, and entertainment.",
    fullDescription: `
      <p>Spring Fest is our annual cultural extravaganza that brings together the entire campus community for three days of non-stop entertainment, cultural performances, and celebration.</p>
      
      <p>This year's theme focuses on unity in diversity, showcasing the rich cultural heritage of our diverse student body through various performances, exhibitions, and interactive experiences.</p>
      
      <h4>Event Highlights:</h4>
      <ul>
        <li>Celebrity performances and concerts</li>
        <li>Cultural dance and music competitions</li>
        <li>Food festival with international cuisines</li>
        <li>Art and craft exhibitions</li>
        <li>Gaming tournaments and fun activities</li>
      </ul>
    `,
    banner: "/placeholder.svg?height=200&width=400&text=Spring+Fest+Banner",
    logo: "/placeholder.svg?height=64&width=64&text=SF",
    inductionsOpen: true,
    inductionsDeadline: "February 28, 2024",
    people: [
      "Ananya Gupta",
      "James Wilson",
      "Fatima Al-Rashid",
      "Carlos Martinez",
    ],
    socialMedia: {
      email: "springfest@university.edu",
      instagram: "https://instagram.com/springfest",
      facebook: "https://facebook.com/springfest",
      twitter: "https://twitter.com/springfest",
    },
  },
  {
    id: "4",
    name: "Environmental Collective",
    category: "collectives",
    description:
      "Working together for a sustainable future through environmental awareness and action.",
    fullDescription: `
      <p>The Environmental Collective is a student-led initiative focused on promoting environmental sustainability and awareness on campus and in the broader community.</p>
      
      <p>We believe in the power of collective action to create meaningful change. Through education, advocacy, and hands-on projects, we work to build a more sustainable future for all.</p>
      
      <h4>Our Initiatives:</h4>
      <ul>
        <li>Campus sustainability audits</li>
        <li>Tree planting and gardening projects</li>
        <li>Waste reduction and recycling programs</li>
        <li>Environmental awareness campaigns</li>
        <li>Clean energy advocacy</li>
      </ul>
    `,
    banner:
      "/placeholder.svg?height=200&width=400&text=Environmental+Collective",
    logo: "/placeholder.svg?height=64&width=64&text=EC",
    inductionsOpen: true,
    inductionsDeadline: "March 10, 2024",
    people: ["Maya Patel", "Tom Anderson", "Zara Ahmed", "Lucas Brown"],
    socialMedia: {
      email: "environment@university.edu",
      instagram: "https://instagram.com/envirocollective",
      website: "https://envirocollective.university.edu",
    },
  },
  {
    id: "5",
    name: "Student Ministry",
    category: "ministry",
    description:
      "Providing spiritual guidance and community support for students of all faiths.",
    fullDescription: `
      <p>The Student Ministry serves as a spiritual home for students seeking community, guidance, and support during their academic journey. We welcome students of all faiths and backgrounds.</p>
      
      <p>Our ministry focuses on building meaningful relationships, providing pastoral care, and creating opportunities for spiritual growth and service to others.</p>
      
      <h4>Services We Offer:</h4>
      <ul>
        <li>Weekly worship services and prayer meetings</li>
        <li>Bible study and discussion groups</li>
        <li>Pastoral counseling and support</li>
        <li>Community service projects</li>
        <li>Interfaith dialogue and events</li>
      </ul>
    `,
    banner: "/placeholder.svg?height=200&width=400&text=Student+Ministry",
    logo: "/placeholder.svg?height=64&width=64&text=SM",
    inductionsOpen: false,
    people: [
      "Pastor John Smith",
      "Sister Mary Catherine",
      "Rabbi David Cohen",
      "Imam Abdullah Hassan",
    ],
    socialMedia: {
      email: "ministry@university.edu",
      facebook: "https://facebook.com/studentministry",
      website: "https://ministry.university.edu",
    },
  },
  {
    id: "6",
    name: "International Students Organization",
    category: "other",
    description:
      "Supporting international students and promoting cross-cultural understanding.",
    fullDescription: `
      <p>The International Students Organization (ISO) is dedicated to supporting international students throughout their academic journey while promoting cross-cultural understanding and global awareness on campus.</p>
      
      <p>We provide a welcoming community for students from around the world and organize events that celebrate our diverse cultures and traditions.</p>
      
      <h4>What We Provide:</h4>
      <ul>
        <li>Orientation programs for new international students</li>
        <li>Cultural celebration events</li>
        <li>Academic and social support networks</li>
        <li>Language exchange programs</li>
        <li>Immigration and visa assistance</li>
      </ul>
    `,
    logo: "/placeholder.svg?height=64&width=64&text=ISO",
    inductionsOpen: true,
    inductionsDeadline: "March 20, 2024",
    people: ["Yuki Tanaka", "Pierre Dubois", "Aisha Okonkwo", "Hans Mueller"],
    socialMedia: {
      email: "iso@university.edu",
      instagram: "https://instagram.com/iso_university",
      facebook: "https://facebook.com/iso.university",
    },
  },
];

// Generate more organisations to reach 73 total
const additionalOrgs: Organisation[] = Array.from({ length: 67 }, (_, i) => {
  const categories: Exclude<
    OrganisationType,
    "show all" | "inductions open"
  >[] = ["society", "club", "fests", "collectives", "ministry", "other"];
  const category = categories[i % categories.length];
  const isInductionsOpen = Math.random() > 0.6;

  return {
    id: `${i + 7}`,
    name: `Organisation ${i + 7}`,
    category,
    description: `This is a sample description for Organisation ${
      i + 7
    }. We focus on bringing students together through various activities and initiatives.`,
    fullDescription: `
      <p>Organisation ${
        i + 7
      } is dedicated to creating meaningful experiences for our members through various programs and activities.</p>
      
      <p>We believe in fostering community, learning, and personal growth among our diverse membership.</p>
      
      <h4>Our Activities:</h4>
      <ul>
        <li>Regular meetings and workshops</li>
        <li>Community service projects</li>
        <li>Social events and networking</li>
        <li>Skill development programs</li>
      </ul>
    `,
    inductionsOpen: isInductionsOpen,
    inductionsDeadline: isInductionsOpen ? "March 25, 2024" : undefined,
    people: [`Member ${i + 1}`, `Member ${i + 2}`, `Member ${i + 3}`],
    socialMedia: {
      email: `org${i + 7}@university.edu`,
      instagram: `https://instagram.com/org${i + 7}`,
    },
  };
});

export const allOrganisations = [...organisations, ...additionalOrgs];
