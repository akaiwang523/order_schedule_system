import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderItem {
  id: number;
  itemNumber: string;
  notes: string | null;
  photoUrl?: string | null;
}

interface Order {
  id: number;
  orderNumber: string;
  bagCount: number;
  itemLocation?: string;
  photoUrl?: string;
}

export default function CustomerOrderOverview() {
  const [location, setLocation] = useLocation();
  const orderId = location.startsWith('/customer/order/') 
    ? parseInt(location.split('/')[3]) 
    : 0;

  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // 查詢訂單詳情
  const { data: order, isLoading: orderLoading } = trpc.order.getById.useQuery(
    { orderId: orderId || 0 },
    { enabled: !!orderId && orderId > 0 }
  );

  // 查詢訂單項目
  const { data: items = [], isLoading: itemsLoading } = trpc.orderItem.getByOrderId.useQuery(
    { orderId: orderId || 0 },
    { enabled: !!orderId && orderId > 0 }
  );

  if (orderLoading || itemsLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">加載中...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">訂單未找到</p>
          <Button
            onClick={() => setLocation('/customer/orders')}
            className="mt-4"
          >
            返回訂單列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{order.orderNumber}</h1>
          <p className="text-gray-600">衣物概況</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setLocation('/customer/orders')}
        >
          ← 返回
        </Button>
      </div>

      {/* 訂單基本信息 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>訂單信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">訂單編號</p>
              <p className="font-semibold">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">袋數</p>
              <p className="font-semibold">{order.bagCount}</p>
            </div>
            {order.itemLocation && (
              <div>
                <p className="text-sm text-gray-600">衣物放置地點</p>
                <p className="font-semibold">
                  {order.itemLocation === 'lobby' && '樂住市集'}
                  {order.itemLocation === 'door' && '家門口'}
                  {order.itemLocation === 'other' && '其他'}
                </p>
              </div>
            )}
            {order.photoUrl && (
              <div>
                <p className="text-sm text-gray-600">訂單照片</p>
                <img
                  src={order.photoUrl}
                  alt="Order photo"
                  className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                  onClick={() => {
                    setSelectedPhotoUrl(order.photoUrl);
                    setShowPhotoModal(true);
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 衣物列表 */}
      <Card>
        <CardHeader>
          <CardTitle>衣物清單</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">暫無衣物記錄</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item: OrderItem) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="mb-3">
                    <p className="font-semibold text-lg">{item.itemNumber}</p>
                    {item.notes && (
                      <p className="text-sm text-gray-600 mt-1">備註：{item.notes}</p>
                    )}
                  </div>

                  {/* 衣物照片 */}
                  {item.photoUrl && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">照片</p>
                      <img
                        src={item.photoUrl}
                        alt={item.itemNumber}
                        className="w-32 h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                        onClick={() => {
                          setSelectedPhotoUrl(item.photoUrl);
                          setShowPhotoModal(true);
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 照片預覽對話框 */}
      <Dialog open={showPhotoModal} onOpenChange={setShowPhotoModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>照片預覽</DialogTitle>
          </DialogHeader>
          {selectedPhotoUrl && (
            <img
              src={selectedPhotoUrl}
              alt="Preview"
              className="w-full h-auto rounded"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
