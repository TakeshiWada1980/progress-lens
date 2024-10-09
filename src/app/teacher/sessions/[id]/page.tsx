"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";

// カスタムフック・APIリクエスト系
import { createGetRequest } from "@/app/_utils/createApiRequest";
import { ApiResponse } from "@/app/_types/ApiResponse";
import useAuth from "@/app/_hooks/useAuth";
import useAuthenticatedGetRequest from "@/app/_hooks/useAuthenticatedGetRequest";

// UIコンポーネント
import PageTitle from "@/app/_components/elements/PageTitle";

// 型・定数・ユーティリティ
import { produce, Draft } from "immer";
import LoadingPage from "@/app/_components/LoadingPage";
import { SessionEditableFields } from "@/app/_types/SessionTypes";

const Page: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const ep = `/api/v1/teacher/sessions/${id}`;
  const { data, mutate } =
    useAuthenticatedGetRequest<SessionEditableFields>(ep);

  if (!data) return <LoadingPage />;

  if (!data.success) {
    return <div>URLがおかしい</div>;
  }

  const s = data.data;

  return (
    <div>
      <PageTitle title={`[編集]: ${s.title}`} />
      <div>{JSON.stringify(data.data, null, 2)}</div>
    </div>
  );
};

export default Page;
