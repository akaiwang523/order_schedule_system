import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setMessage({ type: "error", text: "請輸入帳號和密碼" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      console.log("開始登入，帳號:", email);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log("登入回應:", data);

      if (response.ok && data.id) {
        console.log("登入成功，用戶資料:", data);
        
        // 保持角色為小寫（與資料庫一致）
        const userData = data;
        
        // 調用 login 更新 localStorage 和 useAuth 狀態
        login(userData);
        
        console.log("已保存用戶資料到 localStorage，準備跳轉");
        console.log("用戶角色:", userData.role);

        // 延遲跳轉以確保 useAuth 狀態已更新
        setTimeout(() => {
          console.log("執行跳轉邏輯");
          if (userData.role === "admin") {
            console.log("跳轉到管理員儀表板");
            window.location.href = "/admin/dashboard";
          } else if (userData.role === "staff") {
            console.log("跳轉到員工排程");
            window.location.href = "/staff/schedule";
          } else {
            console.log("跳轉到客戶首頁");
            window.location.href = "/customer/home";
          }
        }, 50)
      } else {
        console.error("登入失敗:", data);
        setMessage({ type: "error", text: data.error || "登入失敗" });
      }
    } catch (error) {
      console.error("登入異常:", error);
      setMessage({ type: "error", text: "登入失敗，請稍後重試" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !confirmPassword.trim() || !fullName.trim()) {
      setMessage({ type: "error", text: "請填寫所有欄位" });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "密碼不相符" });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: "error", text: "密碼至少需要 6 個字符" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "註冊成功，請登入" });
        setMode("login");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFullName("");
      } else {
        setMessage({ type: "error", text: data.error || "註冊失敗" });
      }
    } catch (error) {
      console.error("註冊異常:", error);
      setMessage({ type: "error", text: "註冊失敗，請稍後重試" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">LAUNDRY</CardTitle>
          <CardDescription className="text-center">洗衣物流管理系統</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <div className={`mb-4 p-3 rounded-md text-sm ${
              message.type === "success" 
                ? "bg-green-50 text-green-800 border border-green-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              {message.text}
            </div>
          )}

          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">帳號</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="請輸入帳號"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="password">密碼</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="請輸入密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "登入中..." : "登入"}
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setMode("forgot")}
                  disabled={isLoading}
                >
                  忘記密碼
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setMode("register")}
                  disabled={isLoading}
                >
                  註冊會員
                </Button>
              </div>
            </form>
          )}

          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="fullName">姓名</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="請輸入姓名"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="registerEmail">帳號</Label>
                <Input
                  id="registerEmail"
                  type="email"
                  placeholder="請輸入帳號"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="registerPassword">密碼</Label>
                <Input
                  id="registerPassword"
                  type="password"
                  placeholder="請輸入密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">確認密碼</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="請確認密碼"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "註冊中..." : "註冊"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setMode("login")}
                disabled={isLoading}
              >
                返回登入
              </Button>
            </form>
          )}

          {mode === "forgot" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                請聯絡客服協助您重設密碼。
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setMode("login")}
              >
                返回登入
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
