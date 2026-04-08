import { strapiGet } from './src/lib/apis/strapi';

async function test() {
  try {
    const res = await strapiGet('/ashokan-arounds', {
        filters: { status: 'available' },
        populate: ['student'],
        pagination: { start: 0, limit: 10 },
        sort: ['createdAt:desc']
      });
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err.response?.data || err);
  }
}

test();
