import type { User } from "./types";

export const users: User[] = [
  { id: "u1", name: "Aisyah", role: "staff" },
  { id: "u2", name: "Mr. Tan", role: "owner" },
];

export function getUserById(id: string): User | undefined {
  return users.find((user) => user.id === id);
}
