// A strapi get function which returns the user id of the user with the given email
import { strapiGet } from "@/lib/apis/strapi";

export async function getUserIdByEmail(email: string): Promise<number | null> {
    if (email.trim() === '') {
        return null;
    }
    try {
    const response = await strapiGet(`/users?email=${encodeURIComponent(email)}`)
    const users = response.data || []
    return users.length > 0 ? users[0].id : null
  } catch (error) {
    console.error("Error fetching user by email:", error)
    return null
  }
}
