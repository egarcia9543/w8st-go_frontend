export interface UserDto {
  user: UserDetails;
}

/**
 * `/auth/login` solo devuelve `email` y `name`; `/auth/me` agrega los datos de la sesión.
 */
export interface UserDetails {
  sub?: string;
  email: string;
  name?: string | null;
  iat?: number;
  exp?: number;
}
