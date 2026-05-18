import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) return null;

        if (user.banned) {
          throw new Error("Your account has been banned. Please contact support.");
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { banned: true },
        });
        if (existingUser?.banned) return false;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
      }
      if (trigger === "update" && session) {
        token.name = session.name ?? token.name;
        token.email = session.email ?? token.email;
        token.picture = session.image ?? token.picture;
      }

      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { banned: true, role: true },
        });
        if (dbUser?.banned) return { ...token, banned: true };
        if (dbUser?.role) token.role = dbUser.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        await prisma.userHabitData.create({ data: { userId: user.id } });
      }
    },
    async linkAccount({ user, account, profile }) {
      if (account?.provider) {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "LINK_ACCOUNT",
            entity: "Account",
            entityId: account.providerAccountId,
            metadata: { provider: account.provider },
          },
        });
      }
    },
    async session({ session, token }) {
      if (token?.sub) {
        await prisma.user.update({
          where: { id: token.sub },
          data: { updatedAt: new Date() },
        });
      }
    },
  },
});
