export interface UserProfile {
  id: string;
  name: string;
  email: string;
  plannerNumber: number;
  favoriteEvents: string[];
}

export interface UserSummary {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  plannerNumber?: number;
}

export interface AccountProfile {
  id: string;
  name: string;
  email: string;
}

export interface AuthSession {
  account: AccountProfile;
  planners: UserProfile[];
}
