import { strapiGet } from "@/lib/apis/strapi";

export async function GET() {
    try {
        const data = await strapiGet('sg-mails', {
            populate: {
            sender: {
                fields: ['id', 'email', 'username']
            }
            },
            filters: {
            sender: {
                id: {
                $eq: 1
                }
            }
            }
        });        
        return Response.json(data);
    } catch (error) {
        console.error('Error fetching sg-mails:', error);
        return Response.json({ error: 'Failed to fetch sg-mails' }, { status: 500 });
    }
}