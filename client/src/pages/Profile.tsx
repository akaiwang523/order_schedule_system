import { useState, useEffect } from "react";
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

  // 獲取用戶資料
  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setAddress((user as any).address || "");
      setPhone((user as any).phone || "");
    }
  }, [user]);

  // 更新個人資料 mutation
  const updateProfileMutation = trpc.customer.updateProfile.useMutation({
    onSuccess: () => {
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

    await updateProfileMutation.mutateAsync({
      fullName,
      address,
      phone,
    });
  };

  return (
    <CustomerLayout>
      <div className="space-y-8 max-w-3xl">
        {/* 頁面標題 */}
        <div>
          <h1 className="text-5xl font-bold text-gray-900 mb-2">個人資料</h1>
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
          <CardContent className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-2">電子郵件</p>
              <p className="text-lg text-gray-900 font-medium">{user?.email || "未設定"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-2">帳戶類型</p>
              <p className="text-lg text-gray-900 font-medium">客戶</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-2">加入時間</p>
              <p className="text-lg text-gray-900 font-medium">
                {(user as any)?.createdAt
                  ? new Date((user as any).createdAt).toLocaleDateString("zh-TW")
                  : "未設定"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 提示信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">提示：</span> 修改個人資料後，新增訂單時勾選「同會員註冊資料」將自動填入最新的資訊。
          </p>
        </div>
      </div>
    </CustomerLayout>
  );
}
