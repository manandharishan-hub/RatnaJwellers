import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";

type AuthToken = JWT & {
  id?: string;
  role?: string;
};

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any | null }) {
      const authToken = token as AuthToken;
      if (user) {
        authToken.role = user.role as string;
        authToken.id = user.id?.toString() ?? user._id?.toString();
        authToken.email = user?.email;
      }
      return authToken;
    },
    async session({ session, token }: { session: any; token: JWT }) {
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
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectDB();
        const user = await UserModel.findOne({ email: credentials.email }).select("+password role email name isVerified isBlocked");
        if (!user) {
          throw new Error("Invalid email or password");
        }
        if (user.isBlocked) {
          throw new Error("Your account has been blocked. Contact support.");
        }
        if (!user.isVerified) {
          throw new Error("Please verify your email before signing in.");
        }
        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
};
