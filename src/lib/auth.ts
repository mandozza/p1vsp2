import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Arcade Pass',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'player@pro-project.io' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        await dbConnect();
        
        // In this prototype, we'll auto-create users if they don't exist
        // to simulate an easy "Insert Coin" onboarding flow.
        let user = await User.findOne({ email: credentials.email.toLowerCase() });

        if (!user) {
          const baseUsername = credentials.email.split('@')[0].slice(0, 15);
          user = await User.create({
            email: credentials.email.toLowerCase(),
            name: baseUsername,
            username: `${baseUsername}_${Math.floor(Math.random() * 1000)}`,
            role: 'member',
            creditBalance: 1000,
          });
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          creditBalance: user.creditBalance,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.creditBalance = user.creditBalance;
      }
      
      // Handle balance updates from server actions
      if (trigger === 'update' && session?.creditBalance !== undefined) {
        token.creditBalance = session.creditBalance;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.creditBalance = token.creditBalance;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'secret-development-key',
};
