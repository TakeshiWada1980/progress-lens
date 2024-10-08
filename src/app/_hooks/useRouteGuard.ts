import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/app/_hooks/useAuth";

const useRouteGuard = () => {
  const router = useRouter();
  const { session, isLoading, userProfile } = useAuth();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/");
    }
  }, [isLoading, session, router]);

  // !!session は session !== null && session !== undefined と同じ
  return { isAuthenticated: !!session, isLoading, role: userProfile?.role };
};

export default useRouteGuard;
