import { useState, useCallback, useEffect } from "react";
import CustomerLayout from "@/components/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function Profile() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncedUserId, setLastSyncedUserId] = useState<number | null>(null);

  // 同步用戶資料到本地狀態 - 只在有新的有效數據時才更新
  const syncUserData = useCallback(() => {
    if (!user || !user.id) {
      setIsLoading(false);
      return;
    }

    // 只在用戶 ID 變化時才同步（避免重複同步）
    if (lastSyncedUserId === user.id) {
      setIsLoading(false);
      return;
    }

    // 使用新的用戶數據，但保留已有的數據以防止丟失
    setFullName(prev => user.name || prev);
    setAddress(prev => user.address || prev);
    setPhone(prev => user.phone || prev);
    setLastSyncedUserId(user.id);
    setIsLoading(false);
  }, [user, lastSyncedUserId]);

  // 監聽用戶變化，同步數據
  useEffect(() => {
    syncUserData();
  }, [user?.id, syncUserData]);

  // 第一次載入時，從 localStorage 讀取保存的資料
  useEffect(() => {
    const savedProfile = localStorage.getItem('customerProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        if (profile.fullName) setFullName(profile.fullName);
        if (profile.address) setAddress(profile.address);
        if (profile.phone) setPhone(profile.phone);
      } catch (e) {
        console.error('Failed to parse saved profile:', e);
      }
    }
  }, []);

  // 更新個人資料 mutation
  const updateProfileMutation = trpc.customer.updateProfile.useMutation({
    onSuccess: (data) => {
      // 成功更新後，立即更新本地狀態並保存到前端頁面
      const updatedProfile = {
        fullName: data.fullName || fullName,
        address: data.address || address,
        phone: data.phone || phone,
      };
      
      setFullName(updatedProfile.fullName);
      setAddress(updatedProfile.address);
      setPhone(updatedProfile.phone);
      
      // 自動保存到 localStorage（前端頁面）
      localStorage.setItem('customerProfile', JSON.stringify(updatedProfile));
      
      alert("個人資訊已更新");
      setIsEditing(false);
    },
    onError: (error) => {
      alert(`更新失敗: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !address.trim() || !phone.trim()) {
      alert("請填寫所有欄位");
      return;
    }

    // 先保存到 localStorage（前端頁面）
    const profileData = {
      fullName,
      address,
      phone,
    };
    localStorage.setItem('customerProfile', JSON.stringify(profileData));

    // 然後同步到後端
    await updateProfileMutation.mutateAsync(profileData);
  };

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="space-y-8 max-w-3xl">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">個人資料</h1>
            <p className="text-gray-600 text-lg">查看和修改您的個人資訊</p>
          </div>
          <div className="text-center text-gray-500">載入中...</div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-8 max-w-3xl">
        {/* 頁面標題 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">個人資料</h1>
          <p className="text-gray-600 text-lg">查看和修改您的個人資訊</p>
        </div>

        {/* 基本資訊卡片 */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-gray-900">基本資訊</CardTitle>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className={`${
                  isEditing
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } py-2 px-4 font-semibold`}
              >
                {isEditing ? "取消編輯" : "編輯資料"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 姓名 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  姓名 <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="請輸入姓名"
                    className="border-gray-300"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-medium border border-gray-200">
                    {fullName || "未設定"}
                  </div>
                )}
              </div>

              {/* 電話 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  電話 <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="請輸入電話"
                    className="border-gray-300"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-medium border border-gray-200">
                    {phone || "未設定"}
                  </div>
                )}
              </div>

              {/* 地址 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  地址 <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="請輸入地址"
                    className="border-gray-300"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-medium border border-gray-200">
                    {address || "未設定"}
                  </div>
                )}
              </div>

              {/* 提交按鈕 */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700 py-3 text-base font-semibold"
                  >
                    {updateProfileMutation.isPending ? "保存中..." : "保存修改"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300 py-3 text-base font-semibold"
                  >
                    取消
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* 帳戶資訊卡片 */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">帳戶資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">電子郵件</p>
              <p className="text-gray-900 font-medium">{user?.email || "未設定"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">登入方式</p>
              <p className="text-gray-900 font-medium">{user?.loginMethod || "未知"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
