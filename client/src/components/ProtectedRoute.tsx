import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "CUSTOMER" | "STAFF";
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // 未登入 → 導向登入頁面
    if (!user) {
      setLocation("/login");
      return;
    }

    // 檢查角色權限
    if (requiredRole && user.role !== requiredRole) {
      // 非管理員試圖進入管理員頁面 → 導向客戶頁面
      if (requiredRole === "ADMIN" && user.role !== "ADMIN") {
        setLocation("/orders");
        return;
      }
      // 其他權限不符 → 導向指定頁面
      setLocation(redirectTo);
      return;
    }

    setIsAuthorized(true);
  }, [user, isLoading, requiredRole, redirectTo, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">載入中...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
