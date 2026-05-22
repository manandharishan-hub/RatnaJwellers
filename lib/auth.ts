import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";

type AuthToken = JWT & {
  id?: string;
  role?: string;
};

const DEFAULT_ADMIN_EMAIL = "admin123@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "admin123";

function normalizeRole(role?: string | null) {
  return role === "admin" ? "admin" : "user";
}

function getAdminCredentials() {
  return {
    email: (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD,
  };
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      const authToken = token as AuthToken;
      if (user) {
        authToken.role = (user as any).role as string;
        authToken.id = (user as any).id?.toString() ?? (user as any)._id?.toString();
        authToken.email = user.email;
      }
      return authToken;
    },
    async session({ session, token }) {
      const authToken = token as AuthToken;
      if (authToken) {
        session.user = {
          ...session.user,
          id: authToken.id,
          role: authToken.role,
        } as any;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        adminOnly: { label: "Admin only", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        if (credentials.adminOnly === "true") {
          const admin = getAdminCredentials();
          if (email !== admin.email || password !== admin.password) {
            throw new Error("Invalid admin email or password");
          }
          return {
            id: "env-admin",
            email: admin.email,
            name: "Ratna Jeweler's Admin",
            role: "admin",
          };
        }

        await connectDB();
        const user = await UserModel.findOne({ email }).select("+password role email name isVerified isBlocked");
        if (!user) {
          throw new Error("Invalid email or password");
        }
        if (user.isBlocked) {
          throw new Error("Your account has been blocked. Contact support.");
        }
        if (user.isVerified === false) {
          throw new Error("Please verify your email before signing in.");
        }
        const isValid = await user.comparePassword(password);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: normalizeRole(user.role),
        };
      },
    }),
  ],
};
