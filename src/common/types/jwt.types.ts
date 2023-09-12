export interface JwtPayload {
  nbf?: number; // Not Before
  exp?: number; // Expiration Time
  iat?: number; // Issued At
  iss?: string; // Issuer
  aud?: string; // Audience
  sub?: string; // Subject
  jti?: string; // JWT ID
  nonce?: string; // Nonce
}

export interface UserJwtPayload extends JwtPayload {
  username: string;
  id: number;
}
