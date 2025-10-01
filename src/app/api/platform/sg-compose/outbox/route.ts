import { strapiGet } from "@/lib/apis/strapi";
import { getUserIdByEmail } from "@/lib/userid";
import { auth } from "@/auth";

export async function GET() {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user?.email) {
            return Response.json(
                { error: 'Authentication required' }, 
                { status: 401 }
            );
        }
        
        // Get user ID from email
        const userId = await getUserIdByEmail(session.user.email);
        if (!userId) {
            return Response.json(
                { error: 'User not found' }, 
                { status: 404 }
            );
        }
        
        const data = await strapiGet('sg-mails', {
            populate: {
                sender: {
                    fields: ['id', 'email', 'username']
                }
            },
            filters: {
                sender: {
                    id: {
                        $eq: userId
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