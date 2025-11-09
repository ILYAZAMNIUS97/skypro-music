export interface User {
  id: number;
  email: string;
  username: string;
}

export interface AuthResponse {
  email: string;
  username: string;
  _id: number;
}
