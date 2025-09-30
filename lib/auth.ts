import type { User } from "./types";

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null) {
  if (typeof window === "undefined") return;

  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  } else {
    localStorage.removeItem("currentUser");
  }
}

export function login(email: string, password: string): User | null {
  if (typeof window === "undefined") return null;

  // Get all users from localStorage
  const usersStr = localStorage.getItem("users");
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];

  // Find user by email
  const user = users.find((u) => u.email === email);

  if (user) {
    setCurrentUser(user);
    return user;
  }

  return null;
}

export function signup(name: string, email: string, password: string): User {
  if (typeof window === "undefined") throw new Error("Cannot signup on server");

  // Get all users from localStorage
  const usersStr = localStorage.getItem("users");
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];

  // Check if user already exists
  if (users.find((u) => u.email === email)) {
    throw new Error("User already exists");
  }

  // Create new user
  const newUser: User = {
    id: crypto.randomUUID(),
    name,
    email,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    statusMessage: "",
  };

  // Save to users list
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  // Set as current user
  setCurrentUser(newUser);

  return newUser;
}

export function logout() {
  setCurrentUser(null);
}
