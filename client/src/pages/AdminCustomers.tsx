import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  orderCount: number;
}

interface CustomerHistory {
  id: number;
  date: string;
  bagCount: number;
  amount: number;
  deliveryMethod: string;
}

export default function AdminCustomers() {
  const [customers] = useState<Customer[]>([
    {
      id: 1,
      name: "王小明",
      phone: "0912-345-678",
      address: "台北市信義區",
      orderCount: 5,
    },
    {
      id: 2,
      name: "李小華",
      phone: "0912-345-679",
      address: "台北市中山區",
      orderCount: 3,
    },
    {
      id: 3,
      name: "張小美",
      phone: "0912-345-680",
      address: "台北市大安區",
      orderCount: 8,
    },
  ]);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [customerHistory] = useState<CustomerHistory[]>([
    {
      id: 1,
      date: "2026-04-18",
      bagCount: 3,
      amount: 450,
      deliveryMethod: "到府收送",
    },
    {
      id: 2,
      date: "2026-04-15",
      bagCount: 2,
      amount: 300,
      deliveryMethod: "自行送件",
    },
    {
      id: 3,
      date: "2026-04-10",
      bagCount: 1,
      amount: 150,
      deliveryMethod: "到府收送",
    },
  ]);

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
              <CardContent>
                <div className="space-y-2">
                  {customers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => setSelectedCustomer(customer)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedCustomer?.id === customer.id
                          ? "bg-blue-900 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      <p className="font-semibold">{customer.name}</p>
                      <p className="text-xs text-gray-400">{customer.phone}</p>
                    </button>
                  ))}
                </div>
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
                        {selectedCustomer.name}
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
                        {selectedCustomer.orderCount}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* 歷史訂單 */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">歷史訂單</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="text-left py-3 px-4 text-gray-400">日期</th>
                            <th className="text-left py-3 px-4 text-gray-400">袋數</th>
                            <th className="text-left py-3 px-4 text-gray-400">金額</th>
                            <th className="text-left py-3 px-4 text-gray-400">送件方式</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customerHistory.map((history) => (
                            <tr
                              key={history.id}
                              className="border-b border-gray-800 hover:bg-gray-800/50"
                            >
                              <td className="py-3 px-4 text-white">{history.date}</td>
                              <td className="py-3 px-4 text-gray-300">{history.bagCount}</td>
                              <td className="py-3 px-4 text-gray-300">NT${history.amount}</td>
                              <td className="py-3 px-4 text-gray-300">
                                {history.deliveryMethod}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
