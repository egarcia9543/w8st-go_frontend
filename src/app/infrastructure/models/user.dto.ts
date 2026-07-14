export interface UserDto {
  user: UserDetails;
}

export interface UserDetails {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}
