"use client";

import React, { useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

// カスタムフック・APIリクエスト系
import useAuthenticatedGetRequest from "@/app/_hooks/useAuthenticatedGetRequest";
import AppErrorCode from "@/app/_types/AppErrorCode";

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
import {
  faGhost,
  faRotate,
  faChalkboardUser,
  faCaretRight,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import FormFieldErrorMsg from "@/app/_components/elements/FormFieldErrorMsg";
import DOMPurify from "isomorphic-dompurify";

const Page: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const ep = `/api/v1/student/sessions/${code}`;
  const { data, mutate } = useAuthenticatedGetRequest<SessionSnapshot>(ep);

  const router = useRouter();

  const dataRef = useRef<SessionSnapshot>();
  const getOptimisticLatestData = () => dataRef.current;
  const revalidate = () => mutate(undefined);

  // セッション未登録の場合は「登録ページ」にリダイレクト
  useEffect(() => {
    const isUnenrolled =
      data?.success === false &&
      data.error?.appErrorCode === AppErrorCode.SESSION_NOT_ENROLLED;
    if (isUnenrolled) router.replace(`/student/sessions/?code=${code}`);
  }, [data, code, router]);

  const toSafeHtml = (text: string) => {
    const html = text.replace(/\n/g, "<br>");
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br"],
    });
  };

  if (!data) return <LoadingPage />;

  if (!data.success) {
    return (
      <div>
        <PageTitle title="エラーが発生しました。" className="mb-2" />
        <div className="mb-2">
          <FormFieldErrorMsg msg={data.error.technicalInfo} />
        </div>
        <div className="mb-2">
          <pre className="bg-red-50 p-3 text-xs text-red-700">
            {JSON.stringify(data.error, null, 2)}
          </pre>
        </div>

        <div className="mb-4 flex justify-end">
          <Link href="/student/sessions" className="">
            <FontAwesomeIcon icon={faChalkboardUser} className="mr-1" />
            セッション一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

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
          <button
            className={twMerge(
              "rounded-full bg-gray-300 px-2 py-0.5 text-sm text-white",
              "hover:bg-gray-400"
            )}
            onClick={revalidate}
          >
            <FontAwesomeIcon icon={faRotate} />
            <span className="ml-1 hidden sm:inline">再読込み</span>
          </button>
        </div>
      </div>

      <div className="mb-1 mr-1">
        <div className="text-gray-500">
          <div>
            <FontAwesomeIcon icon={faCaretRight} className="mr-1.5" />
            作成者: {dataRef.current.teacherName}
          </div>
          <div>
            <FontAwesomeIcon icon={faCaretRight} className="mr-1.5" />
            アクセスコード: {dataRef.current.accessCode}
          </div>
        </div>
        {dataRef.current.description !== "" && (
          <div
            className="mt-2"
            dangerouslySetInnerHTML={{
              __html: toSafeHtml(dataRef.current.description),
            }}
          />
        )}
      </div>

      {totalRewardPoint > 0 && (
        <div className="mb-2 mr-1 flex items-end justify-end">
          <div className="mr-1 text-xl font-bold text-pink-700">
            {totalRewardPoint} pt
          </div>
        </div>
      )}

      {!dataRef.current.isActive && (
        <div className="font-bold text-red-400">
          <FontAwesomeIcon icon={faGhost} className="mr-1" />
          このセッションは回答受付を停止中です。
        </div>
      )}

      {dataRef.current.previewMode && (
        <div className="flex">
          <div className="mr-2 font-bold text-red-400">
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
