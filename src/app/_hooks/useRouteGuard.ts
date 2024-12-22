import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/app/_hooks/useAuth";
import { Role } from "@/app/_types/UserTypes";
import { useToast } from "@/app/_components/shadcn/hooks/use-toast";

const useRouteGuard = (requiredRole: Role, returnPath: string) => {
  const router = useRouter();
  const { isLoading, userProfile, session } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();
  useEffect(() => {
    if (isLoading) return;

    // ログインしていなければログインページにリダイレクト
    if (!session) {
      router.replace(`/login?returnPath=${returnPath}`);
      return;
    }

    // userProfileが取得できるまで認可の評価を保留
    if (!userProfile) return;

    // ADMIN権限が要求されるページに、ADMIN以外がアクセスした
    if (requiredRole === Role.ADMIN && userProfile?.role !== Role.ADMIN) {
      toast({
        description: `${returnPath} は管理者権限が必要です。`,
        variant: "destructive",
      });
      router.replace("/");
      return;
    }
    // TEACHER権限が要求されるページに、STUDENT (=ADMIN・TEACHERが以外) がアクセスした
    if (requiredRole === Role.TEACHER && userProfile?.role === Role.STUDENT) {
      toast({
        description: `${returnPath} は教員権限が必要です。`,
        variant: "destructive",
      });
      router.replace("/");
      return;
    }
    setIsAuthorized(true);
  }, [
    isLoading,
    router,
    returnPath,
    requiredRole,
    userProfile,
    toast,
    session,
  ]);

  // ログインかつアクセス権限 (認可) があるかどうかを返す
  return { isAuthorized, isLoading };
};

export default useRouteGuard;
