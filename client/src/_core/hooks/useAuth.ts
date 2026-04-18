import { useEffect, useState } from "react";

export interface User {
  id: number;
  email: string;
  name: string;
  role: "ADMIN" | "CUSTOMER" | "STAFF";
  token?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 從 localStorage 讀取用戶信息
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  const login = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token || "");
    setUser(userData);
  };

  return {
    user,
    isLoading,
    error,
    login,
    logout,
  };
}
