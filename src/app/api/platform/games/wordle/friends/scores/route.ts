import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { strapiGet } from '@/lib/apis/strapi';
import { getUserIdByEmail } from '@/lib/userid';

// Get today's date in YYYY-MM-DD format (India Standard Time)
function getTodayDate(): string {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

interface FriendScore {
    email: string;
    username: string;
    played: boolean;
    won: boolean;
    guesses: number;
    time: number;
    currentStreak: number;
}

/**
 * GET /api/platform/games/wordle/friends/scores
 * Returns today's Wordle scores for all of the current user's friends
 */
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const userId = await getUserIdByEmail(session.user.email);
        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const userResponse = await strapiGet(`/users/${userId}`, {
            fields: ['wordle_data']
        });

        const wordleData = userResponse?.wordle_data || {};
        const friends: string[] = Array.isArray(wordleData.friends) ? wordleData.friends : [];

        if (friends.length === 0) {
            return NextResponse.json({ success: true, scores: [] });
        }

        const today = getTodayDate();
        const scores: FriendScore[] = [];

        // Fetch each friend's data
        for (const friendEmail of friends) {
            try {
                const friendId = await getUserIdByEmail(friendEmail);
                if (!friendId) continue;

                const friendResponse = await strapiGet(`/users/${friendId}`, {
                    fields: ['wordle_data', 'username']
                });

                const friendData = friendResponse?.wordle_data || {};
                const todayData = friendData[today];
                const currentStreak = typeof friendData.streak === 'number' ? friendData.streak : 0;

                if (todayData && todayData.completed) {
                    scores.push({
                        email: friendEmail,
                        username: friendResponse?.username || friendEmail.split('@')[0],
                        played: true,
                        won: todayData.won,
                        guesses: Array.isArray(todayData.guesses) ? todayData.guesses.length : 0,
                        time: todayData.time || 0,
                        currentStreak
                    });
                } else {
                    scores.push({
                        email: friendEmail,
                        username: friendResponse?.username || friendEmail.split('@')[0],
                        played: false,
                        won: false,
                        guesses: 0,
                        time: 0,
                        currentStreak
                    });
                }
            } catch (err) {
                console.error(`Error fetching data for friend ${friendEmail}:`, err);
            }
        }

        return NextResponse.json({ success: true, scores });

    } catch (error) {
        console.error('Error fetching friend scores:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch friend scores' }, { status: 500 });
    }
}
