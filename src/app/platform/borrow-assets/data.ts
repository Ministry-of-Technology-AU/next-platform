import { Asset } from './types';

export const sampleAssets: Asset[] = [
  {
    id: '1',
    name: 'Type C USB Cable',
    model: 'TC-1500',
    description: '1.5 Meters, 50 Grams, Black, 1N Cable, 1N Rating Card',
    tab: 'Techmin',
    type: 'cable',
    status: 'available',
    Image: {
      id: '1',
      url: 'https://images.pexels.com/photos/4526404/pexels-photo-4526404.jpeg?auto=compress&cs=tinysrgb&w=800',
      alternativeText: 'Type C USB Cable'
    },
    bookmarked: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Bluetooth Speaker',
    model: 'Boat Airdopes 131',
    description: 'Portable Bluetooth Speaker with RGB Lights',
    tab: 'Techmin',
    type: 'adapter',
    status: 'available',
    Image: {
      id: '2',
      url: 'https://images.pexels.com/photos/8000616/pexels-photo-8000616.jpeg?auto=compress&cs=tinysrgb&w=800',
      alternativeText: 'Bluetooth Speaker'
    },
    bookmarked: true,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Braided Micro USB Cable',
    model: 'MU-1500',
    description: '1.5 Meters, 52 Grams, Black, 1 N Cable, 1 N Rating Card',
    tab: 'Techmin',
    type: 'cable',
    status: 'available',
    Image: {
      id: '3',
      url: 'https://images.pexels.com/photos/4526404/pexels-photo-4526404.jpeg?auto=compress&cs=tinysrgb&w=800',
      alternativeText: 'Micro USB Cable'
    },
    bookmarked: true,
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
  {
    id: '4',
    name: 'Type C USB Cable',
    model: 'TC-1200',
    description: '1.5 Meters, 50 Grams, Black, 1N Cable, 1N Rating Card',
    tab: 'Techmin',
    type: 'cable',
    status: 'available',
    Image: {
      id: '4',
      url: 'https://images.pexels.com/photos/4526404/pexels-photo-4526404.jpeg?auto=compress&cs=tinysrgb&w=800',
      alternativeText: 'Type C USB Cable'
    },
    bookmarked: false,
    createdAt: '2024-01-04T00:00:00.000Z',
    updatedAt: '2024-01-04T00:00:00.000Z',
  },
  {
    id: '5',
    name: 'YUVA 3 Mobile Phone',
    model: 'YUVA-3-EB',
    description: 'Fast UNISOC T606 Processor (AnTuTu 200K+), 4GB+4GB RAM 64GB UFS 2.2 Memory',
    tab: 'Techmin',
    type: 'mobile',
    status: 'unavailable',
    Image: {
      id: '5',
      url: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800',
      alternativeText: 'YUVA 3 Mobile Phone'
    },
    last_borrow_request: {
      id: '1',
      createdAt: '2024-06-15T00:00:00.000Z',
      updatedAt: '2024-06-30T00:00:00.000Z'
    },
    bookmarked: true,
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: '2024-06-30T00:00:00.000Z',
  },
  {
    id: '6',
    name: 'Type C USB Cable',
    model: 'TC-1800',
    description: '1.5 Meters, 50 Grams, Black, 1N Cable, 1N Rating Card',
    tab: 'Techmin',
    type: 'cable',
    status: 'unavailable',
    Image: {
      id: '6',
      url: 'https://images.pexels.com/photos/4526404/pexels-photo-4526404.jpeg?auto=compress&cs=tinysrgb&w=800',
      alternativeText: 'Type C USB Cable'
    },
    last_borrow_request: {
      id: '2',
      createdAt: '2024-06-10T00:00:00.000Z',
      updatedAt: '2024-06-25T00:00:00.000Z'
    },
    bookmarked: true,
    createdAt: '2024-01-06T00:00:00.000Z',
    updatedAt: '2024-06-25T00:00:00.000Z',
  },
  {
    id: '7',
    name: 'Power Adapter',
    model: 'PA-65W',
    description: '65W USB-C Power Adapter, Fast Charging',
    tab: 'Techmin',
    type: 'adapter',
    status: 'unavailable',
    Image: {
      id: '7',
      url: 'https://images.pexels.com/photos/1363876/pexels-photo-1363876.jpeg?auto=compress&cs=tinysrgb&w=800',
      alternativeText: 'Power Adapter'
    },
    last_borrow_request: {
      id: '3',
      createdAt: '2024-08-15T00:00:00.000Z',
      updatedAt: '2024-08-30T00:00:00.000Z'
    },
    bookmarked: true,
    createdAt: '2024-01-07T00:00:00.000Z',
    updatedAt: '2024-08-30T00:00:00.000Z',
  },
  {
    id: '8',
    name: 'Type C USB Cable',
    model: 'TC-2000',
    description: '1.5 Meters, 50 Grams, Black, 1N Cable, 1N Rating Card',
    tab: 'Techmin',
    type: 'cable',
    status: 'unavailable',
    last_borrow_request: {
      id: '4',
      createdAt: '2024-06-20T00:00:00.000Z',
      updatedAt: '2024-06-30T00:00:00.000Z'
    },
    bookmarked: false,
    createdAt: '2024-01-08T00:00:00.000Z',
    updatedAt: '2024-06-30T00:00:00.000Z',
  },
  {
    id: '9',
    name: 'Wireless Adapter',
    model: 'WA-AC600',
    description: 'AC600 Dual Band USB Wi-Fi Adapter, 802.11ac',
    tab: 'Techmin',
    type: 'adapter',
    status: 'available',
    Image: {
      id: '9',
      url: 'https://images.pexels.com/photos/4526404/pexels-photo-4526404.jpeg?auto=compress&cs=tinysrgb&w=800',
      alternativeText: 'Wireless Adapter'
    },
    bookmarked: false,
    createdAt: '2024-01-09T00:00:00.000Z',
    updatedAt: '2024-01-09T00:00:00.000Z',
  },
  {
    id: '10',
    name: 'HDMI Cable',
    model: 'HDMI-4K-2M',
    description: '2 Meters, 4K Support, Gold Plated Connectors',
    tab: 'Techmin',
    type: 'cable',
    status: 'available',
    Image: {
      id: '10',
      url: 'https://images.pexels.com/photos/4526404/pexels-photo-4526404.jpeg?auto=compress&cs=tinysrgb&w=800',
      alternativeText: 'HDMI Cable'
    },
    bookmarked: true,
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z',
  },
];
