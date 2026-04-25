import { useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const navigationItems = [
    { label: "首頁", path: "/admin/dashboard" },
    { label: "訂單概況", path: "/admin/orders" },
    { label: "會員資料", path: "/admin/customers" },
    { label: "營業概況", path: "/admin/analytics" },
  ];

  return (
    <div className="flex h-screen w-screen bg-gray-950 overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="font-bold text-white text-lg">LAUNDRY</h1>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            <p className="font-semibold text-gray-300">{user?.name}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            登出
          </Button>
        </div>
      </div>

      {/* Main Content - Always 100% width, no margin/padding adjustments */}
      <main className="flex-1 w-full pt-16 overflow-auto">
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
              className="fixed left-0 top-0 h-full w-full max-w-[280px] bg-gray-900 border-r border-gray-800 z-50 flex flex-col shadow-lg"
              style={{
                animation: "slideIn 0.3s ease-out",
              }}
            >
              {/* Logo 區域 */}
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <h1 className="font-bold text-white text-lg">LAUNDRY</h1>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors p-1"
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
                {navigationItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      setLocation(item.path);
                      setSidebarOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg text-left text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* 用戶信息與登出 */}
              <div className="p-4 border-t border-gray-800 space-y-3">
                <div className="text-xs text-gray-400">
                  <p className="font-semibold text-gray-300">{user?.name}</p>
                  <p className="truncate">{user?.email}</p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
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
