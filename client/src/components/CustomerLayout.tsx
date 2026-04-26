import { useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  // 導航菜單項目
  const navItems = [
    { label: "首頁", path: "/customer/home" },
    { label: "新增訂單", path: "/customer/new-order" },
    { label: "歷史訂單", path: "/customer/history" },
    { label: "個人資料", path: "/customer/profile" },
  ];

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Toggle sidebar"
          >
            <span className="text-xl">☰</span>
          </button>
          <h1 className="font-bold text-lg text-blue-600">LAUNDRY</h1>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 hidden sm:block">
            <p className="font-semibold text-gray-800">{user?.name || "使用者"}</p>
          </div>
          <Button
            onClick={handleLogout}
            className="bg-red-50 text-red-600 hover:bg-red-100 text-sm"
            variant="outline"
          >
            登出
          </Button>
        </div>
      </div>

      {/* Main Content - Always 100% width, no margin/padding adjustments */}
      <main className="flex-1 w-full pt-16 overflow-auto" style={{ minWidth: '1024px' }}>
        <div className="p-8">
          {children}
        </div>
      </main>

      {/* Overlay Sidebar using React Portal */}
      {sidebarOpen &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />

            {/* Sidebar Panel - Fixed Position, True Overlay */}
            <div
              className="fixed left-0 top-0 h-full w-full max-w-[280px] bg-white border-r border-gray-200 z-50 flex flex-col shadow-lg"
              style={{
                animation: "slideIn 0.3s ease-out",
              }}
            >
              {/* Logo 區域 */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-lg text-blue-600">LAUNDRY</div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded transition"
                    aria-label="Close sidebar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 導航菜單 */}
              <nav className="flex-1 p-4 space-y-2 overflow-auto">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      setLocation(item.path);
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition text-left text-sm font-medium"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* 用戶信息和登出 */}
              <div className="p-4 border-t border-gray-200 space-y-3">
                <div className="text-xs text-gray-600 space-y-1">
                  <p className="font-semibold text-gray-800">{user?.name || "使用者"}</p>
                  <p className="text-gray-500 truncate">{user?.email}</p>
                </div>
                <Button
                  onClick={handleLogout}
                  className="w-full bg-red-50 text-red-600 hover:bg-red-100 text-sm"
                  variant="outline"
                >
                  登出
                </Button>
              </div>
            </div>
          </>,
          document.body
        )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
