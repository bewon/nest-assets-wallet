export type JwtPayload = {
  sub: string;
  email: string;
};

export type SessionData = {
  userEmail?: string;
  accessToken: string;
} | null;
