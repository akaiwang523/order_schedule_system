import { useMemo } from "react";
import CustomerLayout from "@/components/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function CustomerHome() {
  const { user } = useAuth();

  // 獲取當前用戶的訂單
  const { data: myOrders = [], isLoading } = trpc.order.getMyOrders.useQuery();

  // 篩選出進行中/待處理的訂單
  const pendingOrders = useMemo(() => {
    return myOrders.filter((order: any) => {
      // 篩選出狀態為 pending 或 scheduled 的訂單（非 completed）
      return order.status === "pending" || order.orderStatus === "pending" || order.orderStatus === "scheduled";
    });
  }, [myOrders]);

  // 生成訂單編號 (MMDD-NN 格式)
  const generateOrderNumber = (createdAt: string, index: number) => {
    const date = new Date(createdAt);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const sequence = String(index + 1).padStart(2, "0");
    return `${month}${day}-${sequence}`;
  };

  const getDeliveryLabel = (deliveryType: string) => {
    const labels: Record<string, string> = {
      pickup: "到府收送",
      delivery: "到府收送",
      self: "自行送件",
    };
    return labels[deliveryType] || deliveryType;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "未設定";
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* 歡迎語 - 大字顯示 */}
        <div>
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            歡迎，{user?.name || "使用者"}
          </h1>
          <p className="text-gray-600 text-lg">查看您的訂單狀態和進度</p>
        </div>

        {/* 當前訂單列表 */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">進行中的訂單</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">載入中...</p>
              </div>
            ) : pendingOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg font-medium">目前沒有進行中的訂單</p>
                <p className="text-sm mt-2">點擊側邊欄「新增訂單」建立新訂單</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map((order: any, index: number) => {
                  const orderNumber = generateOrderNumber(order.createdAt, index);
                  return (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:bg-blue-50 transition"
                    >
                      <div className="space-y-4">
                        {/* 第一行：訂單編號、內容、下單日期 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* 訂單編號 - 藍色高亮 */}
                          <div>
                            <p className="text-xs text-gray-500 mb-2 font-semibold">訂單編號</p>
                            <p className="text-2xl font-bold text-blue-600">{orderNumber}</p>
                          </div>

                          {/* 訂單內容 */}
                          <div>
                            <p className="text-xs text-gray-500 mb-2 font-semibold">訂單內容</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {getDeliveryLabel(order.deliveryType)}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{order.bagCount} 袋</p>
                          </div>

                          {/* 下單日期 */}
                          <div>
                            <p className="text-xs text-gray-500 mb-2 font-semibold">下單日期</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* 預計完成日期 - 顯眼標註 */}
                        {order.estimatedCompletionDate && (
                          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                            <p className="text-xs text-amber-700 font-semibold mb-1">預計完成日期</p>
                            <p className="text-xl font-bold text-amber-700">
                              {formatDate(order.estimatedCompletionDate)}
                            </p>
                          </div>
                        )}

                        {/* 備註 */}
                        {order.notes && (
                          <div className="pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-2 font-semibold">備註</p>
                            <p className="text-sm text-gray-700">{order.notes}</p>
                          </div>
                        )}

                        {/* 狀態徽章 */}
                        <div className="flex items-center gap-2">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                            進行中
                          </span>
                          <span className="text-xs text-gray-500">
                            付款狀態：{order.paymentStatus === "paid" ? "已付款" : "未付款"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
