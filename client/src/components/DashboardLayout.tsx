import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { LayoutDashboard, LogOut, PanelLeft, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { useAuth } from "@/_core/hooks/useAuth";

const menuItems = [
  { icon: LayoutDashboard, label: "Page 1", path: "/" },
  { icon: Users, label: "Page 2", path: "/some-path" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [, navigate] = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = async () => {
    // Logout logic here
    navigate("/");
  };

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Button onClick={() => (window.location.href = getLoginUrl())}>
          登入
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Main Content - Always 100% width, no margin/padding adjustments */}
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between h-16 border-b bg-background px-4 z-20">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className="h-9 w-9 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Toggle navigation"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-accent px-2 py-1 rounded-lg transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline">
                  {user.name}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                登出
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>

      {/* Overlay Sidebar using React Portal */}
      {!isCollapsed &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={toggleSidebar}
              aria-hidden="true"
            />

            {/* Sidebar Panel - Fixed Position, True Overlay */}
            <div
              className="fixed left-0 top-0 h-full w-full max-w-[400px] bg-sidebar border-r z-50 flex flex-col shadow-lg"
              style={{
                animation: "slideIn 0.3s ease-out",
              }}
            >
              {/* Sidebar Header */}
              <div className="h-16 border-b flex items-center justify-between px-4">
                <h2 className="font-semibold">Navigation</h2>
                <button
                  onClick={toggleSidebar}
                  className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors"
                  aria-label="Close sidebar"
                >
                  <PanelLeft className="h-4 w-4" />
                </button>
              </div>

              {/* Sidebar Menu */}
              <div className="flex-1 overflow-auto p-4">
                <nav className="space-y-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsCollapsed(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Sidebar Footer */}
              <div className="border-t p-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span>登出</span>
                </button>
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
