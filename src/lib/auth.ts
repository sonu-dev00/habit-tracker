import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { verify as verifyTotp } from "otplib";
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
        totp: { label: "Two-factor code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;
        const totp = credentials.totp as string | undefined;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) return null;

        if (user.banned) {
          throw new Error("Your account has been banned. Please contact support.");
        }

        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
          const remainingMs = user.lockoutUntil.getTime() - Date.now();
          const remainingMin = Math.ceil(remainingMs / 60000);
          throw new Error(
            `Account temporarily locked. Try again in ${remainingMin} minute${remainingMin === 1 ? "" : "s"}.`
          );
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          const MAX_ATTEMPTS = 5;
          const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
          const newAttempts = user.failedLoginAttempts + 1;

          if (newAttempts >= MAX_ATTEMPTS) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: newAttempts,
                lockoutUntil: new Date(Date.now() + LOCKOUT_DURATION_MS),
              },
            });
          } else {
            await prisma.user.update({
              where: { id: user.id },
              data: { failedLoginAttempts: newAttempts },
            });
          }

          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0, lockoutUntil: null },
        });

        if (user.twoFactorEnabled) {
          if (!totp) {
            throw new Error("Two-factor authentication code required.");
          }
          if (!user.twoFactorSecret) {
            throw new Error("2FA is misconfigured. Contact support.");
          }
          const validTotp = verifyTotp({ token: totp, secret: user.twoFactorSecret });
          if (!validTotp) {
            throw new Error("Invalid two-factor authentication code.");
          }
        }

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
