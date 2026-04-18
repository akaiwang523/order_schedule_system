import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CustomerOrders() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState<any[]>([]);

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
            <p className="text-xs text-gray-400">客戶服務</p>
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
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === "orders"
                  ? "bg-gray-700 text-gray-100"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              📦 我的訂單
            </button>
            <button
              onClick={() => setActiveTab("new-order")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === "new-order"
                  ? "bg-gray-700 text-gray-100"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              ➕ 新增訂單
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === "schedule"
                  ? "bg-gray-700 text-gray-100"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              📅 預約排程
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === "profile"
                  ? "bg-gray-700 text-gray-100"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              👤 個人資料
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-100 mb-6">我的訂單</h2>
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-100">訂單列表</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-gray-400 text-center py-12">
                      暫無訂單
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="p-4 bg-gray-800 rounded-lg">
                          <p className="text-gray-100">訂單 #{order.id}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "new-order" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-100 mb-6">新增訂單</h2>
              <Card className="bg-gray-900 border-gray-800 max-w-2xl">
                <CardHeader>
                  <CardTitle className="text-gray-100">訂單表單</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">袋數</Label>
                      <Input
                        type="number"
                        placeholder="請輸入袋數"
                        className="bg-gray-800 border-gray-700 text-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">送貨方式</Label>
                      <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-100 rounded">
                        <option>到府收件</option>
                        <option>到府送回</option>
                        <option>自行送件</option>
                      </select>
                    </div>
                    <Button className="w-full bg-gray-700 hover:bg-gray-600 text-gray-100">
                      提交訂單
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "schedule" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-100 mb-6">預約排程</h2>
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-100">排程列表</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-400 text-center py-12">
                    暫無排程
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "profile" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-100 mb-6">個人資料</h2>
              <Card className="bg-gray-900 border-gray-800 max-w-2xl">
                <CardHeader>
                  <CardTitle className="text-gray-100">個人資訊</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm">姓名</p>
                      <p className="text-gray-100">{user?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-gray-100">{user?.email}</p>
                    </div>
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
