import type { IntercolEvent } from './types';

// Placeholder data for building the UI. The college names are made up on
// purpose. This file gets replaced by Strapi data later.
export const sampleEvents: IntercolEvent[] = [
  {
    id: '1',
    name: 'Inter-College Hackathon 2026',
    hostCollege: 'St. Aurelius College',
    category: 'tech',
    description: 'A 24-hour hackathon open to teams from any college.',
    fullDescription:
      'Teams of up to four build a working prototype in 24 hours around a theme revealed on the day. Mentors from local startups will be on site, and the top three teams win cash prizes.',
    bannerUrl: null,
    location: 'Delhi',
    startDate: '2026-12-05',
    endDate: '2026-12-06',
    registrationUrl: 'https://example.com/register/hackathon',
    registrationDeadline: '2026-11-30',
  },
  {
    id: '2',
    name: 'Winter Cultural Fest',
    hostCollege: 'Northfield University',
    category: 'cultural',
    description: 'Music, dance and theatre competitions across three days.',
    fullDescription:
      'Colleges send teams for solo and group events in music, dance, drama and fine arts. Evening concerts are open to all registered attendees.',
    bannerUrl: null,
    location: 'Gurugram',
    startDate: '2026-12-12',
    endDate: '2026-12-14',
    registrationUrl: 'https://example.com/register/winter-fest',
    registrationDeadline: '2026-12-05',
  },
  {
    id: '3',
    name: 'Inter-College Basketball Cup',
    hostCollege: 'Riverside Institute',
    category: 'sports',
    description: 'Knockout basketball tournament for men’s and women’s teams.',
    fullDescription:
      'Sixteen teams enter a knockout bracket. Each college may register one men’s and one women’s team of up to twelve players.',
    bannerUrl: null,
    location: 'Noida',
    startDate: '2026-12-19',
    endDate: null,
    registrationUrl: null,
    registrationDeadline: null,
  },
  {
    id: '4',
    name: 'Model United Nations',
    hostCollege: 'Hartwell College',
    category: 'academic',
    description: 'Three-day MUN with six committees and over 300 delegates.',
    fullDescription:
      'Delegates debate in committees ranging from the UN Security Council to a crisis simulation. Best Delegate and Best Position Paper awards in every committee.',
    bannerUrl: null,
    location: 'Delhi',
    startDate: '2027-01-09',
    endDate: '2027-01-11',
    registrationUrl: 'https://example.com/register/mun',
    registrationDeadline: '2027-01-02',
  },
  {
    id: '5',
    name: 'Open Mic Night',
    hostCollege: 'Lakeview College',
    category: 'other',
    description: 'An evening of poetry, stand-up and live music. Anyone can sign up.',
    fullDescription:
      'Sign up at the door for a five-minute slot. No judging, no prizes, just a friendly crowd.',
    bannerUrl: null,
    location: 'Faridabad',
    startDate: '2027-01-16',
    endDate: null,
    registrationUrl: null,
    registrationDeadline: null,
  },
];