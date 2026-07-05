import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "./prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            console.error("[AUTH DEBUG] Faltan credenciales");
            return null;
          }

          console.log(`[AUTH DEBUG] Buscando usuario: ${credentials.username}`);
          const user = await prisma.adminUser.findUnique({
            where: { username: credentials.username as string }
          });

          if (!user) {
            console.error(`[AUTH DEBUG] Usuario ${credentials.username} no encontrado en la BD`);
            return null;
          }

          console.log("[AUTH DEBUG] Usuario encontrado, comparando hash...");
          const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);
          
          if (!isValid) {
            console.error("[AUTH DEBUG] Contraseña incorrecta");
            return null;
          }

          console.log("[AUTH DEBUG] Login exitoso");
          return { id: user.id.toString(), name: user.name, username: user.username };
        } catch (error) {
          console.error("[AUTH DEBUG] Error interno en authorize:", error);
          throw error;
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = (user as any).username
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username
      }
      return session
    }
  },
  pages: {
    signIn: '/admin/login'
  }
})
