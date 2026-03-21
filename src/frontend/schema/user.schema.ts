export interface UserAccount {
  uid: string;
  email: string;
  displayName: string;
  role: "ADMIN" | "CUSTOMER";
  createdAt: string;
  lastLogin?: string;
}

export type UserRole = "ADMIN" | "CUSTOMER";