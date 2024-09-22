"use client";

import React, { useRef, useCallback } from "react";
import QuestionView from "./_components/QuestionView";
import { produce, Draft } from "immer";
import useAuthenticatedGetRequest from "@/app/_hooks/useAuthenticatedGetRequest";
import { v4 as uuid } from "uuid";
import dev from "@/app/_utils/devConsole";
import {
  SessionEditableFields,
  QuestionEditFields,
  OptionEditFields,
} from "@/app/_types/SessionTypes";
import LoadingPage from "@/app/_components/LoadingPage";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";

const Page: React.FC = () => {
  const id = "cm1cwbud4000lua0bxfmxkwl0"; // TODO: デバッグ用
  const ep = `/api/v1/teacher/sessions/${id}`;
  const { data, mutate } =
    useAuthenticatedGetRequest<SessionEditableFields>(ep);
  const dataRef = useRef<SessionEditableFields>();
  const nextQuestionIdNum = useRef(4);

  const revalidate = () => {
    dev.console.log("APIを叩いて再取得（再検証）");
    mutate(undefined);
  };

  if (!data) return <LoadingPage />;

  dataRef.current = data.data!;
  const getOptimisticLatestData = () => {
    return dataRef.current;
  };

  const questions = data.data!.questions;

  return (
    <div>
      <div className="mb-4 flex space-x-2">
        <button
          className="rounded-md border px-3 py-1 text-sm"
          // onClick={addQuestion}
        >
          設問追加
        </button>

        <button
          className="rounded-md border px-3 py-1 text-sm"
          onClick={revalidate}
        >
          再取得（再検証）
        </button>
      </div>

      <div>
        {questions.map((question) => (
          <QuestionView
            key={question.id}
            question={question}
            getOptimisticLatestData={getOptimisticLatestData}
            mutate={mutate}
          />
        ))}
      </div>
    </div>
  );
};

export default Page;
