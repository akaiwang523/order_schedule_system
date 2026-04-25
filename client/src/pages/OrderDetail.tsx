'use client';

import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

interface OrderItem {
  id: number;
  orderId: number;
  itemNumber: string;
  notes: string | null;
  photoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  bagCount: number;
  notes?: string;
}

export default function OrderDetail() {
  const [location] = useLocation();
  const orderNumber = location.startsWith('/order/') ? location.substring(7) : '';
  const [, setLocation] = useLocation();
  const { user, isLoading: userLoading } = useAuth();

  // 狀態管理
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [itemCount, setItemCount] = useState<number>(0);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [photoItemId, setPhotoItemId] = useState<number | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [itemPhotos, setItemPhotos] = useState<{ [key: number]: string[] }>({});
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 監聽用戶變化，同步數據
  const { data: queriedOrder, isLoading: orderLoading, error: orderError } = trpc.order.getByOrderNumber.useQuery(
    { orderNumber: orderNumber || "" },
    { enabled: !!orderNumber && !userLoading }
  );

  // 調試：打印錯誤信息
  useEffect(() => {
    if (orderError) {
      console.error('Order query error:', orderError);
    }
  }, [orderError]);

  // 獲取訂單項目
  const { data: orderItems, refetch: refetchOrderItems } = trpc.orderItem.getByOrderId.useQuery(
    { orderId: order?.id || 0 },
    { enabled: !!order?.id }
  );

  // 創建衣物編號的 mutation
  const createItemMutation = trpc.orderItem.create.useMutation({
    onSuccess: () => {
      refetchOrderItems();
      setItemCount(0);
      setErrorMessage("");
    },
    onError: (error) => {
      setErrorMessage(`新增衣物失敗: ${error.message}`);
    },
  });

  // 更新衣物備註的 mutation
  const updateItemMutation = trpc.orderItem.update.useMutation({
    onSuccess: () => {
      refetchOrderItems();
      setEditingItemId(null);
      setEditingNotes("");
    },
  });

  // 刪除衣物的 mutation
  const deleteItemMutation = trpc.orderItem.delete.useMutation({
    onSuccess: () => {
      refetchOrderItems();
    },
  });

  // 監聽訂單查詢結果
  useEffect(() => {
    if (!orderLoading) {
      if (queriedOrder) {
        setOrder(queriedOrder);
      }
      setIsLoading(false);
    }
  }, [queriedOrder, orderLoading]);

  // 監聽訂單項目
  useEffect(() => {
    if (orderItems) {
      // 按 itemNumber 排序（例如：260424-02-01, 260424-02-02...）
      const sortedItems = [...orderItems].sort((a, b) => {
        // 提取最後的序號部分進行數值比較
        const aNum = parseInt(a.itemNumber.split('-').pop() || '0');
        const bNum = parseInt(b.itemNumber.split('-').pop() || '0');
        return aNum - bNum;
      });
      setItems(sortedItems);
      // 初始化照片列表
      const photosMap: { [key: number]: string[] } = {};
      sortedItems.forEach(item => {
        if (item.photoUrl) {
          photosMap[item.id] = [item.photoUrl];
        } else {
          photosMap[item.id] = [];
        }
      });
      setItemPhotos(photosMap);
    }
  }, [orderItems]);

  // 生成衣物編號
  const generateItemNumbers = () => {
    if (!order || itemCount <= 0) {
      setErrorMessage("請先選擇訂單並輸入件數");
      return;
    }

    if (!order.orderNumber) {
      setErrorMessage("訂單編號不存在，請重新加載頁面");
      return;
    }

    if (!order.id) {
      setErrorMessage("訂單 ID 不存在，請重新加載頁面");
      return;
    }

    // 生成多個衣物編號
    for (let i = 1; i <= itemCount; i++) {
      const itemNumber = `${order.orderNumber}-${String(i).padStart(2, "0")}`;
      createItemMutation.mutate({ orderId: order.id, itemNumber, notes: "" });
    }
  };

  // 拍照功能
  const handleTakePhoto = (itemId: number) => {
    setPhotoItemId(itemId);
    fileInputRef.current?.click();
  };

  // 處理照片上傳
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !photoItemId) return;

    try {
      setIsUploadingPhoto(true);
      
      // 上傳照片到 S3
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      const photoUrl = data.url;
      
      // 添加照片到列表
      setItemPhotos(prev => ({
        ...prev,
        [photoItemId]: [...(prev[photoItemId] || []), photoUrl]
      }));
      
      // 更新衣物的 photoUrl（保存第一張照片）
      if (!itemPhotos[photoItemId] || itemPhotos[photoItemId].length === 0) {
        updateItemMutation.mutate({
          itemId: photoItemId,
          photoUrl: photoUrl,
        });
      }
    } catch (error) {
      setErrorMessage("照片上傳失敗，請重試");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 刪除照片
  const handleDeletePhoto = (itemId: number, photoIndex: number) => {
    setItemPhotos(prev => {
      const photos = prev[itemId] || [];
      const newPhotos = photos.filter((_, idx) => idx !== photoIndex);
      return {
        ...prev,
        [itemId]: newPhotos
      };
    });
  };

  // 顯示照片放大預覽
  const handleShowPhoto = (photoUrl: string) => {
    setSelectedPhotoUrl(photoUrl);
    setShowPhotoModal(true);
  };

  if (isLoading || userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
        <p className="text-gray-600">加載中...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setLocation("/customer/home")}
            className="mb-6"
          >
            ← 返回
          </Button>
          <p className="text-gray-600">訂單不存在或已被刪除</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 返回按鈕 */}
        <Button
          variant="ghost"
          onClick={() => setLocation("/customer/home")}
          className="mb-6"
        >
          ← 返回
        </Button>

        {/* 訂單標題 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            訂單編號：{order.orderNumber}
          </h1>
          <p className="text-gray-600">管理您的衣物編號和照片</p>
        </div>

        {/* 衣物編號輸入區 */}
        <Card className="bg-white border-gray-200 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">衣物件數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                type="number"
                min="1"
                value={itemCount}
                onChange={(e) => setItemCount(parseInt(e.target.value) || 0)}
                placeholder="請輸入件數"
                className="flex-1"
              />
              <Button
                onClick={generateItemNumbers}
                disabled={itemCount <= 0 || createItemMutation.isPending}
                className="bg-blue-600 text-white hover:bg-blue-700 px-6"
              >
                {createItemMutation.isPending ? "生成中..." : "輸入"}
              </Button>
            </div>
            {errorMessage && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errorMessage}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 衣物編號列表 */}
        {items.length > 0 && (
          <Card className="bg-white border-gray-200 shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">衣物清單</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    {/* 衣物編號 */}
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-lg text-gray-900">{item.itemNumber}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTakePhoto(item.id)}
                          disabled={isUploadingPhoto && photoItemId === item.id}
                        >
                          {isUploadingPhoto && photoItemId === item.id ? "上傳中..." : "拍照"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingItemId(item.id);
                            setEditingNotes(item.notes || "");
                            setShowItemDialog(true);
                          }}
                        >
                          備註
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteItemMutation.mutate({ itemId: item.id })}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* 備註 */}
                    {item.notes && (
                      <p className="text-sm text-gray-600 mb-3">備註：{item.notes}</p>
                    )}

                    {/* 照片列表 */}
                    {itemPhotos[item.id] && itemPhotos[item.id].length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-semibold text-gray-700 mb-2">照片（{itemPhotos[item.id].length}張）</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {itemPhotos[item.id].map((photoUrl, photoIndex) => (
                            <div key={photoIndex} className="relative group">
                              <img
                                src={photoUrl}
                                alt={`照片 ${photoIndex + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => handleShowPhoto(photoUrl)}
                              />
                              <button
                                onClick={() => handleDeletePhoto(item.id, photoIndex)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <span className="absolute bottom-1 left-1 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                                {String(photoIndex + 1).padStart(2, '0')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 備註編輯對話框 */}
        <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>編輯衣物備註</DialogTitle>
            </DialogHeader>
            <Textarea
              value={editingNotes}
              onChange={(e) => setEditingNotes(e.target.value)}
              placeholder="輸入備註..."
              className="min-h-[100px]"
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowItemDialog(false)}
              >
                取消
              </Button>
              <Button
                onClick={() => {
                  if (editingItemId) {
                    updateItemMutation.mutate({
                      itemId: editingItemId,
                      notes: editingNotes,
                    });
                  }
                }}
              >
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 照片放大預覽對話框 */}
        <Dialog open={showPhotoModal} onOpenChange={setShowPhotoModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>照片預覽</DialogTitle>
            </DialogHeader>
            {selectedPhotoUrl && (
              <img
                src={selectedPhotoUrl}
                alt="照片預覽"
                className="w-full h-auto rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>

        {/* 隱藏的文件輸入框 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}
