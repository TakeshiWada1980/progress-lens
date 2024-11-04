"use client";

import React, { useRef } from "react";
import { useParams } from "next/navigation";

// カスタムフック・APIリクエスト系
import useAuthenticatedGetRequest from "@/app/_hooks/useAuthenticatedGetRequest";

// UIコンポーネント
import PageTitle from "@/app/_components/elements/PageTitle";
import LoadingPage from "@/app/_components/LoadingPage";
import {
  SessionSnapshot,
  sessionSnapshotSchema,
} from "@/app/_types/SessionTypes";
import QuestionContent from "./_components/QuestionContent";
import Link from "@/app/_components/elements/Link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGhost, faRetweet } from "@fortawesome/free-solid-svg-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/shadcn/ui/tooltip";

const Page: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const ep = `/api/v1/student/sessions/${code}`;
  const { data, mutate } = useAuthenticatedGetRequest<SessionSnapshot>(ep);

  const dataRef = useRef<SessionSnapshot>();
  const getOptimisticLatestData = () => dataRef.current;
  const revalidate = () => mutate(undefined);

  if (!data) return <LoadingPage />;

  dataRef.current = sessionSnapshotSchema.parse(data.data);
  const totalRewardPoint = dataRef.current.questions
    .flatMap((question) => question.options)
    .filter((option) => option.isUserResponse)
    .reduce((acc, option) => acc + option.rewardPoint, 0);

  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <PageTitle title={dataRef.current.title} />
        <div className="pr-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="text-xl text-gray-300 hover:text-gray-400"
                  onClick={revalidate}
                >
                  <FontAwesomeIcon icon={faRetweet} />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-700 text-white">
                <p>再読み込み</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="mb-2 mr-1 flex items-end justify-between">
        <div className=" text-gray-400">
          <div>作成者: {dataRef.current.teacherName}</div>
          <div>アクセスコード: {dataRef.current.accessCode}</div>
        </div>
        {totalRewardPoint > 0 && (
          <div className="mr-1 text-xl font-bold text-pink-700">
            {totalRewardPoint} pt
          </div>
        )}
      </div>

      {!dataRef.current.isActive && (
        <div className="font-bold text-red-400">
          <FontAwesomeIcon icon={faGhost} className="mr-1" />
          このセッションは回答受付を終了しました。
        </div>
      )}

      {dataRef.current.previewMode && (
        <div className="flex">
          <div className="font-bold text-red-400 mr-2">
            <FontAwesomeIcon icon={faGhost} className="mr-1" />
            プレビューモード (回答は保存されません)
          </div>
          <Link href={`/teacher/sessions/${dataRef.current.id}`}>
            編集に戻る
          </Link>
        </div>
      )}

      <div>
        <div className="space-y-2">
          {dataRef.current!.questions.map((question) => (
            <QuestionContent
              key={question.id}
              question={question}
              getOptimisticLatestData={getOptimisticLatestData}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <span>
          <Link href="/student/sessions" className="">
            セッション一覧
          </Link>
          <span className="text-sm">に戻る</span>
        </span>
      </div>

      {/* <pre className="mt-10 bg-blue-50 text-xs">
        {JSON.stringify(dataRef.current, null, 2)}
      </pre> */}
    </div>
  );
};

export default Page;
