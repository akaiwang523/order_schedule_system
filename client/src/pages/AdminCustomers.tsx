import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function AdminCustomers() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [, setLocation] = useLocation();

  // 搜尋時清除選中的客戶
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSelectedCustomerId(null);
    }
  };

  // 獲取所有客戶
  const { data: customers = [], isLoading: customersLoading } = trpc.adminCustomer.getAll.useQuery();

  // 搜尋篩選客戶 - 搜尋前不顯示任何會員
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return [];  // 搜尋前返回空陣列
    const query = searchQuery.toLowerCase();
    return customers.filter((customer: any) => 
      customer.fullName.toLowerCase().includes(query) ||
      customer.phone.includes(query)
    );
  }, [customers, searchQuery]);

  // 獲取選定客戶的訂單歷史
  const { data: customerOrderHistory = [] } = trpc.adminCustomer.getOrderHistory.useQuery(
    { customerId: selectedCustomerId || 0 },
    { enabled: selectedCustomerId !== null }
  );

  // 獲取選定的客戶詳情
  const selectedCustomer = useMemo(() => {
    return customers.find((c: any) => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  // 計算客戶的訂單統計
  const customerStats = useMemo(() => {
    if (!customerOrderHistory) return { orderCount: 0, totalAmount: 0 };
    return {
      orderCount: customerOrderHistory.length,
      totalAmount: customerOrderHistory.reduce((sum: number, order: any) => {
        return sum + (order.bagCount * 150);
      }, 0),
    };
  }, [customerOrderHistory]);

  // 篩選訂單
  const filteredOrderHistory = useMemo(() => {
    if (!customerOrderHistory) return [];
    return customerOrderHistory.filter((order: any) => {
      if (filterStatus === "all") return true;
      return order.orderStatus === filterStatus;
    });
  }, [customerOrderHistory, filterStatus]);

  const getCategoryLabel = (deliveryType: string) => {
    const labels: Record<string, string> = {
      pickup: "到府收送 - 收件",
      delivery: "到府收送 - 送回",
      self: "自行送件",
    };
    return labels[deliveryType] || deliveryType;
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">會員資料</h1>
          <p className="text-gray-400">查看和管理客戶信息</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 會員列表 */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">會員列表</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 搜尋框 */}
                <input
                  type="text"
                  placeholder="按姓名或電話搜尋..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                {customersLoading ? (
                  <div className="text-gray-400">載入中...</div>
                ) : filteredCustomers.length === 0 ? (
                  <div></div>
                ) : (
                  <div className="space-y-2">
                    {filteredCustomers.slice(0, 3).map((customer: any) => (
                      <div
                        key={customer.id}
                        className="bg-gray-800 border border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => setSelectedCustomerId(customer.id)}
                      >
                        <p className="font-semibold text-white">{customer.fullName}</p>
                        <p className="text-xs text-gray-400">{customer.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 會員詳情與歷史訂單 */}
          <div className="lg:col-span-2 space-y-6">
            {selectedCustomer ? (
              <>
                {/* 會員詳情 */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">會員詳情</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm">姓名</p>
                      <p className="text-white text-lg font-semibold">
                        {selectedCustomer.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">電話</p>
                      <p className="text-white">{selectedCustomer.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">地址</p>
                      <p className="text-white">{selectedCustomer.address}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">訂單數</p>
                      <p className="text-white text-lg font-semibold">
                        {customerStats.orderCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">總消費金額</p>
                      <p className="text-white text-lg font-semibold">
                        NT${customerStats.totalAmount}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* 歷史訂單 */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-white">歷史訂單</CardTitle>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setFilterStatus("all")}
                          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                            filterStatus === "all"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                          }`}
                        >
                          全部
                        </button>
                        <button
                          onClick={() => setFilterStatus("completed")}
                          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                            filterStatus === "completed"
                              ? "bg-green-600 text-white"
                              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                          }`}
                        >
                          已完成
                        </button>
                        <button
                          onClick={() => setFilterStatus("pending")}
                          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                            filterStatus === "pending"
                              ? "bg-yellow-600 text-white"
                              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                          }`}
                        >
                          待處理
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {filteredOrderHistory.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        {customerOrderHistory.length === 0 ? "該客戶暂無訂單" : "沒有符合篩選條件的訂單"}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredOrderHistory.map((order: any) => (
                          <div
                            key={order.id}
                            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors cursor-pointer"
                            onClick={() => setLocation(`/order/${order.orderNumber}`)}
                          >
                            {/* 訂單基本信息 */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <p className="text-gray-400 text-xs">訂單編號</p>
                                <p className="text-white font-semibold">{order.orderNumber || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs">下單日期</p>
                                <p className="text-white">{order.createdAt?.split('T')[0] || '未知'}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs">送件方式</p>
                                <p className="text-white">{getCategoryLabel(order.deliveryType)}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs">狀態</p>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold inline-block ${
                                    order.orderStatus === "completed"
                                      ? "bg-green-900 text-green-200"
                                      : "bg-yellow-900 text-yellow-200"
                                  }`}
                                >
                                  {order.orderStatus === "completed" ? "已完成" : "待處理"}
                                </span>
                              </div>
                            </div>

                            {/* 訂單詳細資料 */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-700">
                              <div>
                                <p className="text-gray-400 text-xs">袋數</p>
                                <p className="text-white font-semibold">{order.bagCount}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs">付費方式</p>
                                <p className="text-white">{order.paymentMethod || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs">付費狀態</p>
                                <p className="text-white">{order.paymentStatus || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs">金額</p>
                                <p className="text-white font-semibold">NT${order.bagCount * 150}</p>
                              </div>
                            </div>

                            {/* 訂單備註 */}
                            {order.notes && (
                              <div className="mt-4 pt-4 border-t border-gray-700">
                                <p className="text-gray-400 text-xs">備註</p>
                                <p className="text-gray-300 text-sm">{order.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">請選擇一個會員查看詳情</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
