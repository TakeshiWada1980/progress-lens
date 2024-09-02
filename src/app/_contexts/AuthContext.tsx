import React, { createContext, useMemo, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import ApiRequestHeader from "@/app/_types/ApiRequestHeader";
import { UserProfile } from "@/app/_types/UserTypes";
import createGetRequest from "@/app/_utils/createGetRequest";
import { ApiResponse } from "../_types/ApiResponse";

interface AuthContextProps {
  session: Session | null | undefined;
  isLoading: boolean;
  token: string | null;
  apiRequestHeader: ApiRequestHeader;
  userProfile: UserProfile | null;
  setIsUserProfileRefreshRequired: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  logout: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined
);

interface Props {
  children: React.ReactNode;
}

const AuthProvider: React.FC<Props> = ({ children }) => {
  // session => undefined: 取得中, null: 未ログイン, Session: ログイン済み
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiRequestHeader, setApiRequestHeader] = useState<ApiRequestHeader>({
    Authorization: null,
  });

  const getApiCaller = useMemo(
    () => createGetRequest<ApiResponse<UserProfile>>(),
    []
  );

  const [isUserProfileRefreshRequired, setIsUserProfileRefreshRequired] =
    useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
      return false;
    }
    return true;
  };

  // セッションに変更があった場合や子コンポーネントからのリクエストがあった場合にユーザ情報を再取得
  useEffect(() => {
    const ep = `/api/v1/user/profile`;
    const fetchUserProfile = async () => {
      if (session && isUserProfileRefreshRequired) {
        try {
          const res = await getApiCaller(ep, apiRequestHeader);
          const userData = res.data;
          setUserProfile(userData);

          setIsUserProfileRefreshRequired(false);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    fetchUserProfile();
  }, [session, isUserProfileRefreshRequired, getApiCaller, apiRequestHeader]);

  const fetchSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setSession(session);
    setToken(session?.access_token || null);
    setIsLoading(false);
  };

  const refreshSession = async () => {
    console.log("RefreshSession!");
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession();
    if (error) {
      console.error("Error refreshing session:", error);
    } else {
      setSession(session);
      setToken(session?.access_token || null);
    }
  };

  useEffect(() => {
    fetchSession();

    // ログイン状況を監視（確実にUIに反映させるため）
    const { data: listener } = supabase.auth.onAuthStateChange((e, session) => {
      setSession(session);
      setToken(session?.access_token || null);
      setApiRequestHeader({ Authorization: session?.access_token || null });
      if (e === "SIGNED_OUT") {
        setUserProfile(null);
        setIsUserProfileRefreshRequired(true);
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setApiRequestHeader({ Authorization: token });
    if (!session) return;
    const expiresAt = session.expires_at;
    if (expiresAt) {
      const expirationDate = new Date(expiresAt * 1000);
      const timeout = expiresAt * 1000 - Date.now() - 60000; // 1分前にリフレッシュ
      const refreshTimeout = setTimeout(refreshSession, timeout);
      return () => clearTimeout(refreshTimeout);
    }
  }, [token, session]);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        apiRequestHeader,
        token,
        userProfile,
        setIsUserProfileRefreshRequired,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
