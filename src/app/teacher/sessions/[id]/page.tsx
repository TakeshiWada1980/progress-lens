"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";

// カスタムフック・APIリクエスト系
import { createGetRequest } from "@/app/_utils/createApiRequest";
import { ApiResponse } from "@/app/_types/ApiResponse";
import useAuth from "@/app/_hooks/useAuth";

// UIコンポーネント
import PageTitle from "@/app/_components/elements/PageTitle";

// 型・定数・ユーティリティ
import { SessionEditModel } from "@/app/_types/SessionTypes";
import { produce, Draft } from "immer";
import LoadingPage from "@/app/_components/LoadingPage";

const Page: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const { apiRequestHeader } = useAuth();
  // prettier-ignore
  const getApiCaller = useMemo(() => createGetRequest<ApiResponse<SessionEditModel>>(),[]);

  // session は 子コンポーネントに Props として渡すためのものであり
  // setSession が呼ばれると子コンポーネントが再レンダリングされる
  const [session, setSession] = useState<SessionEditModel | null>(null);

  // optimisticSession は、子コンポーネントにおける楽観的更新と同期をとっているもの
  // setSession(optimisticSession) は、全ての子コンポーネントで再レンダリングが必要なときに使う
  const [optimisticSession, setOptimisticSession] =
    useState<SessionEditModel | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const ep = `/api/v1/teacher/sessions/${id}`;
      try {
        const res = await getApiCaller(ep, apiRequestHeader);
        console.log("■ <<< " + JSON.stringify(res, null, 2));
        setSession(res.data);
        setOptimisticSession(
          produce(res.data, (draft: Draft<SessionEditModel>) => {})
        );
      } catch (error) {
        console.error("APIの呼び出しに失敗しました:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, [id, apiRequestHeader, getApiCaller]);

  return (
    <div>
      <PageTitle title={`AccessCode: ${id}`} />
      <div>未実装</div>
    </div>
  );
};

export default Page;
