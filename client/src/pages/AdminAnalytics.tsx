import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MonthlyStats {
  month: string;
  revenue: number;
  orderCount: number;
  bagCount: number;
}

export default function AdminAnalytics() {
  const [monthlyStats] = useState<MonthlyStats[]>([
    { month: "2026年1月", revenue: 25000, orderCount: 45, bagCount: 120 },
    { month: "2026年2月", revenue: 32000, orderCount: 58, bagCount: 155 },
    { month: "2026年3月", revenue: 38000, orderCount: 72, bagCount: 195 },
    { month: "2026年4月", revenue: 45000, orderCount: 85, bagCount: 230 },
  ]);

  const totalRevenue = monthlyStats.reduce((sum, stat) => sum + stat.revenue, 0);
  const totalOrders = monthlyStats.reduce((sum, stat) => sum + stat.orderCount, 0);
  const totalBags = monthlyStats.reduce((sum, stat) => sum + stat.bagCount, 0);
  const averageRevenue = Math.round(totalRevenue / monthlyStats.length);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">營業概況</h1>
          <p className="text-gray-400">查看營業統計和分析</p>
        </div>

        {/* 總體統計 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="pt-6">
              <p className="text-gray-400 text-sm mb-2">總營業額</p>
              <p className="text-3xl font-bold text-white">NT${totalRevenue}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="pt-6">
              <p className="text-gray-400 text-sm mb-2">平均月營業額</p>
              <p className="text-3xl font-bold text-white">NT${averageRevenue}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="pt-6">
              <p className="text-gray-400 text-sm mb-2">總訂單數</p>
              <p className="text-3xl font-bold text-white">{totalOrders}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="pt-6">
              <p className="text-gray-400 text-sm mb-2">總袋數</p>
              <p className="text-3xl font-bold text-white">{totalBags}</p>
            </CardContent>
          </Card>
        </div>

        {/* 月份統計表 */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">月份統計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400">月份</th>
                    <th className="text-left py-3 px-4 text-gray-400">營業額</th>
                    <th className="text-left py-3 px-4 text-gray-400">訂單數</th>
                    <th className="text-left py-3 px-4 text-gray-400">袋數</th>
                    <th className="text-left py-3 px-4 text-gray-400">平均訂單額</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyStats.map((stat, index) => (
                    <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-4 text-white">{stat.month}</td>
                      <td className="py-3 px-4 text-white font-semibold">NT${stat.revenue}</td>
                      <td className="py-3 px-4 text-gray-300">{stat.orderCount}</td>
                      <td className="py-3 px-4 text-gray-300">{stat.bagCount}</td>
                      <td className="py-3 px-4 text-gray-300">
                        NT${Math.round(stat.revenue / stat.orderCount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 趨勢分析 */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">營業趨勢</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyStats.map((stat, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">{stat.month}</span>
                    <span className="text-white font-semibold">NT${stat.revenue}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${(stat.revenue / Math.max(...monthlyStats.map((s) => s.revenue))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
