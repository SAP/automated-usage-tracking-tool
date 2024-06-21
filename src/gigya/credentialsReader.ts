import dotenv from 'dotenv'

export interface Credentials {
  userKey: string
  secret: string
}

export default class CredentialsReader {
  static {
    dotenv.config() // Load environment variables from .env file
  }
  private static credentials: Credentials

  private constructor() {}

  static get(): Credentials {
    if (!this.credentials) {
      if (process.env.USER_KEY && process.env.SECRET) {
        this.credentials = {
          userKey: process.env.USER_KEY,
          secret: process.env.SECRET,
        }
      }
    }
    return this.credentials
  }
}
