import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";

interface Order {
  id: number;
  orderNumber: string;
  bagCount: number;
  progress: string;
  createdAt: string;
  itemLocation?: string;
  photoUrl?: string;
}

export default function CustomerOrders() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");

  // 查詢客戶的訂單
  const { data: orders = [], isLoading } = trpc.order.getByCustomerId.useQuery(
    { customerId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  const handleLogout = () => {
    // 實現登出邏輯
    setLocation("/login");
  };

  // 檢查是否應該顯示「衣物概況」按鈕
  const shouldShowClothingOverview = (progress: string) => {
    const showableStatuses = ["received", "washing", "returning", "completed"];
    return showableStatuses.includes(progress);
  };

  // 獲取進度標籤
  const getProgressLabel = (progress: string) => {
    const labels: { [key: string]: string } = {
      pending: "待取件",
      received: "已收件",
      washing: "洗滌中",
      returning: "歸還中",
      completed: "已完成",
    };
    return labels[progress] || progress;
  };

  // 獲取進度標籤顏色
  const getProgressColor = (progress: string) => {
    const colors: { [key: string]: string } = {
      pending: "bg-yellow-100 text-yellow-800",
      received: "bg-blue-100 text-blue-800",
      washing: "bg-purple-100 text-purple-800",
      returning: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
    };
    return colors[progress] || "bg-gray-100 text-gray-800";
  };

  return (
    <Layout pageTitle="我的訂單">
      {activeTab === "orders" && (
        <div>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">加載中...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">還沒有訂單</p>
              <Button
                onClick={() => setLocation("/customer/new-order")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                新增訂單
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-8 flex items-center justify-center cursor-pointer hover:shadow-lg transition"
                  onClick={() => setLocation("/customer/new-order")}>
                  <div className="text-center">
                    <div className="text-4xl mb-3">+</div>
                    <p className="text-lg font-semibold text-blue-900">新增訂單</p>
                    <p className="text-sm text-blue-700 mt-1">點擊建立新訂單</p>
                  </div>
                </div>

                {orders.map((order: Order) => (
                  <Card key={order.id} className="hover:shadow-lg transition">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-500">訂單編號</p>
                          <p className="text-lg font-semibold text-gray-900">{order.orderNumber}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getProgressColor(order.progress)}`}>
                          {getProgressLabel(order.progress)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                        <div className="flex justify-between">
                          <span className="text-gray-600">訂單日期</span>
                          <span className="font-medium text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString("zh-TW")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">袋數</span>
                          <span className="font-medium text-gray-900">{order.bagCount} 袋</span>
                        </div>
                        {order.itemLocation && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">衣物放置地點</span>
                            <span className="font-medium text-gray-900">
                              {order.itemLocation === 'lobby' && '樂住市集'}
                              {order.itemLocation === 'door' && '家門口'}
                              {order.itemLocation === 'other' && '其他'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        {shouldShowClothingOverview(order.progress) && (
                          <Button
                            onClick={() => setLocation(`/customer/order/${order.id}/overview`)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            衣物概況
                          </Button>
                        )}
                        <Button
                          onClick={() => setLocation(`/customer/order/${order.id}`)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          查看詳情
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 統計卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600 mb-2">總訂單數</p>
                    <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600 mb-2">總袋數</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {orders.reduce((sum: number, o: Order) => sum + o.bagCount, 0)} 袋
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600 mb-2">已完成</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {orders.filter((o: Order) => o.progress === "completed").length}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      )}
    </Layout>
  );
}
