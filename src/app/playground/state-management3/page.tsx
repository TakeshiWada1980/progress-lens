"use client";

import React, { useRef, useCallback } from "react";
import QuestionView from "./_components/QuestionView";
import { produce, Draft } from "immer";
import useAuthenticatedGetRequest from "@/app/_hooks/useAuthenticatedGetRequest";
import { v4 as uuid } from "uuid";
import dev from "@/app/_utils/devConsole";
import { Question } from "./_types/types";
import LoadingPage from "@/app/_components/LoadingPage";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";

const Page: React.FC = () => {
  const ep = "/api/alpha/state-management";
  const { data, mutate } = useAuthenticatedGetRequest<Question[]>(ep);
  const dataRef = useRef<Question[]>();
  const nextQuestionIdNum = useRef(4);

  const addQuestion = useCallback(async () => {
    // [POST] /api/v1/teacher/sessions/[id]/add-question
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Dummy
    const newQuestion: Question = {
      id: String(nextQuestionIdNum.current),
      title: `設問${nextQuestionIdNum.current}`,
      compareKey: uuid(),
      defaultOptionId: `${nextQuestionIdNum.current}-1`,
      options: [
        {
          id: `${nextQuestionIdNum.current}-1`,
          title: "A",
          questionId: String(nextQuestionIdNum.current),
          compareKey: uuid(),
        },
        {
          id: `${nextQuestionIdNum.current}-2`,
          title: "B",
          questionId: String(nextQuestionIdNum.current),
          compareKey: uuid(),
        },
        {
          id: `${nextQuestionIdNum.current}-3`,
          title: "C",
          questionId: String(nextQuestionIdNum.current),
          compareKey: uuid(),
        },
      ],
    };
    //
    const x = produce(data?.data, (draft: Draft<Question[]>) => {
      // draft.push(newQuestion);
      draft.unshift(newQuestion);
    });
    const optimisticRes = new SuccessResponseBuilder<Question[]>(x!)
      .setHttpStatus(StatusCodes.OK)
      .build();
    mutate(optimisticRes, false);

    nextQuestionIdNum.current++;
  }, [data?.data, mutate]);

  const revalidate = () => {
    dev.console.log("APIを叩いて再取得（再検証）");
    mutate(undefined);
  };

  if (!data) return <LoadingPage />;

  const questions = data.data!;
  dataRef.current = questions;
  const getOptimisticLatestData = () => {
    return dataRef.current;
  };

  return (
    <div>
      <div className="mb-4 flex space-x-2">
        <button
          className="rounded-md border px-3 py-1 text-sm"
          onClick={addQuestion}
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
