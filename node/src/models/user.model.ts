export interface User {
  id: string;
  email: string;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
}

export interface CreateUserDTO {
  email: string;
}

export interface UpdateUserDTO {
  is_verified?: boolean;
  last_login_at?: Date;
}
