import type { User } from "./types";

export const users: User[] = [
  { id: "u1", name: "Aisyah", role: "staff" },
  { id: "u2", name: "Mr. Tan", role: "owner" },
];

export function getUserById(id: string): User | undefined {
  return users.find((user) => user.id === id);
}

export function registerUser(user: User): User {
  if (user.id === "u1" || user.id === "u2") throw new Error("That user id is reserved.");
  const email = user.email?.trim().toLowerCase();
  if (users.some((existing) => existing.id === user.id || (email && existing.email?.toLowerCase() === email))) {
    throw new Error("That email is already used.");
  }
  users.push(user);
  return user;
}
