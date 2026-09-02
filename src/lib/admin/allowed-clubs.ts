export interface AllowedClubDef {
  name: string;
  aliases: string[];
  emails: string[];
}

export function normalizeSlug(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * The exact whitelist of 49 student clubs and societies that have visibility in the Admin Panel.
 */
export const ALLOWED_ADMIN_CLUBS: AllowedClubDef[] = [
  // Page 1
  {
    name: "Abhinaya",
    aliases: ["abhinaya", "dance-society", "dance-society-abhinaya"],
    emails: ["dancesociety@ashoka.edu.in"],
  },
  {
    name: "Art and Design Collective",
    aliases: ["art-and-design-collective", "art-design-collective", "adc", "art-collective"],
    emails: ["art.society@ashoka.edu.in"],
  },
  {
    name: "Ashoka Consulting Club",
    aliases: ["ashoka-consulting-club", "consulting-club", "acc"],
    emails: ["consulting@ashoka.edu.in"],
  },
  {
    name: "Ashoka Debating Union",
    aliases: ["ashoka-debating-union", "debating-union", "debating", "adu"],
    emails: ["debating@ashoka.edu.in"],
  },
  {
    name: "Ashoka Fintech Club",
    aliases: ["ashoka-fintech-club", "fintech-club", "fintech"],
    emails: [],
  },
  {
    name: "Ashoka Farm Fresh: the Kitchen Gardening Club",
    aliases: ["ashoka-farm-fresh", "farm-fresh", "kitchen-gardening-club", "farmfresh"],
    emails: ["farmfresh@ashoka.edu.in"],
  },
  {
    name: "Ashoka Investments Club",
    aliases: ["ashoka-investments-club", "investments-club", "aic", "investmentsclub"],
    emails: ["investmentsclub@ashoka.edu.in"],
  },
  {
    name: "Ashoka MUN",
    aliases: ["ashoka-mun", "mun", "model-united-nations"],
    emails: ["ashoka.mun@ashoka.edu.in"],
  },
  {
    name: "Ashoka University International Students Association (AUISA)",
    aliases: ["auisa", "ashoka-university-international-students-association", "international-students-association"],
    emails: ["auisa@ashoka.edu.in"],
  },

  // Page 2
  {
    name: "Ashoka Women in Business & Leadership",
    aliases: ["ashoka-women-in-business-leadership", "women-in-business-leadership", "awibnl", "awibl", "women-in-business"],
    emails: ["awibnl@ashoka.edu.in"],
  },
  {
    name: "Caperture",
    aliases: ["caperture", "photography-club"],
    emails: ["caperture@ashoka.edu.in"],
  },
  {
    name: "Eeshto: The Board Gaming Society",
    aliases: ["eeshto", "eeshto-the-board-gaming-society", "board-gaming-society", "board-gaming"],
    emails: ["eeshto@ashoka.edu.in"],
  },
  {
    name: "Hum Rahi",
    aliases: ["hum-rahi", "humrahi", "travel-initiative"],
    emails: [],
  },
  {
    name: "Enactus, Ashoka University",
    aliases: ["enactus", "enactus-ashoka-university", "enactus-ashoka"],
    emails: ["enactus@ashoka.edu.in"],
  },
  {
    name: "Hallyu : Korean Cultural Club",
    aliases: ["hallyu", "hallyu-korean-cultural-club", "korean-cultural-club", "korean-club"],
    emails: ["hallyu@ashoka.edu.in"],
  },
  {
    name: "Her Campus Ashoka",
    aliases: ["her-campus-ashoka", "her-campus", "hcashoka"],
    emails: ["hcashoka@ashoka.edu.in"],
  },
  {
    name: "Hindvi",
    aliases: ["hindvi", "hindi-urdu-club", "hindiurdu"],
    emails: ["hindiurdu@ashoka.edu.in"],
  },

  // Page 3
  {
    name: "Lang-up",
    aliases: ["lang-up", "langup", "language-learning"],
    emails: ["langup@ashoka.edu.in"],
  },
  {
    name: "Mad Batter: The Baking Club",
    aliases: ["mad-batter", "mad-batter-the-baking-club", "the-baking-club", "baking-club", "madbatter"],
    emails: ["madbatter@ashoka.edu.in"],
  },
  {
    name: "Navrang",
    aliases: ["navrang", "filmsoc", "film-society"],
    emails: ["filmsoc@ashoka.edu.in"],
  },
  {
    name: "Neev",
    aliases: ["neev", "community-engagement"],
    emails: ["neev@ashoka.edu.in"],
  },
  {
    name: "Orators – Public Speaking Club",
    aliases: ["orators", "orators-public-speaking-club", "public-speaking-club", "orators-club"],
    emails: ["orators@ashoka.edu.in"],
  },
  {
    name: "Pawsitive",
    aliases: ["pawsitive", "animal-welfare"],
    emails: ["pawsitive@ashoka.edu.in"],
  },
  {
    name: "Red Brick Words",
    aliases: ["red-brick-words", "poetry-club", "poetry"],
    emails: ["poetry@ashoka.edu.in"],
  },
  {
    name: "Ruhi",
    aliases: ["ruhi", "support-staff-english"],
    emails: ["ruhi@ashoka.edu.in"],
  },

  // Page 4
  {
    name: "Siyahi",
    aliases: ["siyahi", "art-society"],
    emails: ["art.society@ashoka.edu.in"],
  },
  {
    name: "The Anime Club",
    aliases: ["the-anime-club", "anime-club", "anime"],
    emails: ["anime@ashoka.edu.in"],
  },
  {
    name: "The Comic Relief",
    aliases: ["the-comic-relief", "comic-relief", "thecomicrelief"],
    emails: ["thecomicrelief@ashoka.edu.in"],
  },
  {
    name: "The Common Room",
    aliases: ["the-common-room", "common-room"],
    emails: [],
  },
  {
    name: "The Feminist Collective",
    aliases: ["the-feminist-collective", "feminist-collective", "feministcollective"],
    emails: ["feministcollective@ashoka.edu.in"],
  },
  {
    name: "The Green Room",
    aliases: ["the-green-room", "green-room", "theatresociety", "theatre-society"],
    emails: ["theatresociety@ashoka.edu.in"],
  },
  {
    name: "The Northeast Collective",
    aliases: ["the-northeast-collective", "northeast-collective", "northeastcollective"],
    emails: ["northeastcollective@ashoka.edu.in"],
  },
  {
    name: "The Rotaract Club",
    aliases: ["the-rotaract-club", "rotaract-club", "rotaract"],
    emails: ["rotaract@ashoka.edu.in"],
  },
  {
    name: "Quizzing Society",
    aliases: ["quizzing-society", "quizzing"],
    emails: ["quizzing@ashoka.edu.in"],
  },

  // Page 5
  {
    name: "Vistaar",
    aliases: ["vistaar", "music-society"],
    emails: ["vistaar@ashoka.edu.in"],
  },
  {
    name: "Khayaal",
    aliases: ["khayaal", "khayal", "filmmakingclub", "filmmaking-club"],
    emails: ["filmmakingclub@ashoka.edu.in"],
  },
  {
    name: "Sustainable Development Goals",
    aliases: ["sustainable-development-goals", "ausdg", "sdg", "society-for-sustainable-development-goals"],
    emails: ["ausdg@ashoka.edu.in"],
  },
  {
    name: "CLAD",
    aliases: ["clad", "fashion-club", "fashion-makeup-design"],
    emails: ["clad@ashoka.edu.in"],
  },
  {
    name: "Kaagazi",
    aliases: ["kaagazi", "origami-club", "origami"],
    emails: ["kaagazi@ashoka.edu.in"],
  },
  {
    name: "CODA",
    aliases: ["coda", "yearbook-club", "yearbook"],
    emails: ["coda@ashoka.edu.in"],
  },
  {
    name: "Untangled",
    aliases: ["untangled", "crochet-club", "crochet"],
    emails: [],
  },
  {
    name: "Ashoka Impact Finance Club",
    aliases: ["ashoka-impact-finance-club", "impact-finance-club", "impactfinance", "impact-finance"],
    emails: ["impactfinance@ashoka.edu.in"],
  },

  // PDF 2 Page 1
  {
    name: "Ashoka Next Gen Leaders",
    aliases: ["ashoka-next-gen-leaders", "next-gen-leaders", "nextgen-leaders"],
    emails: ["suryansh.dalmia_ugt2024@ashoka.edu.in"],
  },
  {
    name: "AI for all",
    aliases: ["ai-for-all", "aiforall", "ai-for-all-club"],
    emails: ["nayantara.bista_ug2025@ashoka.edu.in"],
  },
  {
    name: "Etude Club",
    aliases: ["etude-club", "etude"],
    emails: ["auroni.sarkar_ug2025@ashoka.edu.in"],
  },
  {
    name: "IFSA",
    aliases: ["ifsa", "ifsa-ashoka", "international-finance-students-association"],
    emails: ["aaditya.chandra_ug2024@ashoka.edu.in"],
  },
  {
    name: "Girls into VC",
    aliases: ["girls-into-vc", "givc", "girls-in-vc"],
    emails: ["aahana.jain_ug2025@ashoka.edu.in"],
  },
  {
    name: "Koel",
    aliases: ["koel", "koel-magazine"],
    emails: ["aditi.ponnammal_ug2023@ashoka.edu.in"],
  },
  {
    name: "WOWS",
    aliases: ["wows", "women-of-worth"],
    emails: ["kaashvi.dewan_ug2025@ashoka.edu.in"],
  },
];

/**
 * Checks if a given organisation matches any of the attached allowed clubs.
 */
export function isAllowedAdminClub(
  orgName: string,
  orgSlug?: string | null,
  orgEmail?: string | null
): boolean {
  const normName = normalizeSlug(orgName);
  const normSlug = normalizeSlug(orgSlug);
  const normEmail = (orgEmail || "").toLowerCase().trim();

  return ALLOWED_ADMIN_CLUBS.some((club) => {
    // 1. Exact or normalized email match
    if (normEmail && club.emails.some((e) => e.toLowerCase().trim() === normEmail)) {
      return true;
    }

    // 2. Direct name or slug match
    const clubNormName = normalizeSlug(club.name);
    if (normName === clubNormName || normSlug === clubNormName) {
      return true;
    }

    // 3. Substring / alias match
    if (
      club.aliases.some((alias) => {
        const normAlias = normalizeSlug(alias);
        return (
          normName === normAlias ||
          normSlug === normAlias ||
          normName.includes(normAlias) ||
          normAlias.includes(normName) ||
          (normSlug && (normSlug.includes(normAlias) || normAlias.includes(normSlug)))
        );
      })
    ) {
      return true;
    }

    return false;
  });
}
