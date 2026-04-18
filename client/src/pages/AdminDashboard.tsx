import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("schedule");

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-100">LAUNDRY</h1>
            <p className="text-xs text-gray-400">管理後台</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">{user?.name}</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              登出
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("schedule")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === "schedule"
                  ? "bg-gray-700 text-gray-100"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              📅 當日排程
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === "orders"
                  ? "bg-gray-700 text-gray-100"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              📦 訂單管理
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === "members"
                  ? "bg-gray-700 text-gray-100"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              👥 客戶清單
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === "settings"
                  ? "bg-gray-700 text-gray-100"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              ⚙️ 系統設定
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === "schedule" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-100 mb-6">當日排程</h2>
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-100">今日行程</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-400 text-center py-12">
                    暫無排程數據
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-100 mb-6">訂單管理</h2>
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-100">所有訂單</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-400 text-center py-12">
                    暫無訂單數據
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "members" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-100 mb-6">客戶清單</h2>
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-100">客戶列表</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-400 text-center py-12">
                    暫無客戶數據
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-100 mb-6">系統設定</h2>
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-100">設定選項</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-400 text-center py-12">
                    系統設定功能開發中
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
