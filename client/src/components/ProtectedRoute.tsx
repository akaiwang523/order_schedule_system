import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "CUSTOMER" | "STAFF" | "USER" | "user" | "admin";
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
    if (requiredRole) {
      const userRole = (user.role || "").toLowerCase();
      const requiredRoleLower = (requiredRole || "").toLowerCase();
      
      // 特殊處理：customer 和 user 視為相同角色
      const normalizedUserRole = userRole === "user" ? "customer" : userRole;
      const normalizedRequiredRole = requiredRoleLower === "user" ? "customer" : requiredRoleLower;
      
      // 角色必須完全匹配
      if (normalizedUserRole !== normalizedRequiredRole) {
        // 非管理員試圖進入管理員頁面 → 導向客戶頁面
        if (normalizedRequiredRole === "admin" && normalizedUserRole !== "admin") {
          setLocation("/customer/home");
          return;
        }
        // 管理員試圖進入客戶頁面 → 導向管理員頁面
        if (normalizedRequiredRole === "customer" && normalizedUserRole === "admin") {
          setLocation("/admin/dashboard");
          return;
        }
        // 其他權限不符 → 導向指定頁面
        setLocation(redirectTo);
        return;
      }
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
