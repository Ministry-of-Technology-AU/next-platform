import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {        
      role: string
      access: string[]
      email: string
      name: string
      image: string
    } & DefaultSession["user"]
  }

  interface User {
    role?: string
    access?: string[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    access?: string[]
    email?: string
    name?: string
    picture?: string
  }
}
