import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

// Special admin emails list for organization access
const ORGANIZATION_EMAILS = [
  "technology.ministry@ashoka.edu.in",
  "sg@ashoka.edu.in",
  // Add more organization emails as needed
]

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 2 * 24 * 60 * 60, // 48 hours
  },
  trustHost: true, // Important for NextAuth v5
  secret: process.env.NEXTAUTH_SECRET, // Add explicit secret
  callbacks: {
    async signIn({ user }: any) {
      // Only allow @ashoka.edu.in emails
      if (!user.email?.endsWith('@ashoka.edu.in')) {
        console.log(`Rejected sign-in attempt from: ${user.email}`);
        return false;
      }
      
      console.log(`Successful sign-in: ${user.email}`);
      return true;
    },
    
    async jwt({ token, user }: any) {
      // Initial sign in
      if (user) {
        const email = user.email!;
        
        // Determine user role based on email patterns
        if (ORGANIZATION_EMAILS.includes(email)) {
          token.role = 'organization';
          token.access = ['platform', 'organization'];
        } else if (email.includes('_ug')) {
          token.role = 'student';
          token.access = ['platform'];
        } else {
          token.role = 'user';
          token.access = ['platform']; // Default access
        }
        
        token.email = email;
        token.name = user.name;
        token.picture = user.image;
        
        console.log(`JWT created for ${email} with role: ${token.role}`);
      }
      
      return token;
    },
    
    async session({ session, token }: any) {
      if (session.user && token) {
        session.user.role = token.role as string;
        session.user.access = token.access as string[];
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      
      return session;
    }
  },
  
  pages: {
    signIn: '/api/auth/signin',
    error: '/api/auth/error',
  },
  
  events: {
    async signIn(message: any) {
      console.log('Sign in event:', message.user?.email);
    },
    async signOut(message: any) {
      console.log('Sign out event:', message.token?.email);
    }
  }
})