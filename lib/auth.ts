import type { User } from "./types";

export function getCurrentUser(): User | null {
  if (typeof window !== "undefined") {
    // 클라이언트 사이드에서는 localStorage 사용
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // 서버 사이드에서는 null 반환 (Redis는 별도 함수로 처리)
  return null;
}

export async function getCurrentUserAsync(userId?: string): Promise<User | null> {
  if (typeof window !== "undefined") {
    // 클라이언트 사이드에서는 localStorage 사용
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // 서버 사이드에서는 Redis 사용 (동적 import로 빌드 오류 방지)
  if (!userId) return null;
  
  try {
    const { getRedisClient } = await import("./redis");
    const redis = await getRedisClient();
    const userData = await redis.get(`user:${userId}`);

    if (userData) {
      return JSON.parse(userData);
    }
  } catch (error) {
    console.error("Redis에서 사용자 정보 가져오기 실패:", error);
  }

  return null;
}

export function setCurrentUser(user: User | null) {
  if (typeof window === "undefined") return;

  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  } else {
    localStorage.removeItem("currentUser");
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { getRedisClient } = await import("./redis");
    const redis = await getRedisClient();
    const userId = await redis.get(`user:email:${email}`);

    if (userId) {
      const userData = await redis.get(`user:${userId}`);
      if (userData) {
        return JSON.parse(userData);
      }
    }
  } catch (error) {
    console.error("Redis에서 사용자 정보 가져오기 실패:", error);
  }

  return null;
}

export async function saveUser(user: User): Promise<void> {
  try {
    const { getRedisClient } = await import("./redis");
    const redis = await getRedisClient();
    await redis.set(`user:${user.id}`, JSON.stringify(user));
    await redis.set(`user:email:${user.email}`, user.id);
  } catch (error) {
    console.error("Redis에 사용자 정보 저장 실패:", error);
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
