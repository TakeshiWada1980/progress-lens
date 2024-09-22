"use client";

import React, { useRef, useCallback, useMemo } from "react";
import QuestionView from "./_components/QuestionView";
import { produce, Draft } from "immer";
import useAuthenticatedGetRequest from "@/app/_hooks/useAuthenticatedGetRequest";
import { v4 as uuid } from "uuid";
import dev from "@/app/_utils/devConsole";
import {
  SessionEditableFields,
  AddQuestionRequest,
  sessionEditableFieldsSchema,
  addQuestionRequestSchema,
  questionEditableFieldsSchema,
  QuestionEditableFields,
} from "@/app/_types/SessionTypes";
import { ApiResponse } from "@/app/_types/ApiResponse";

import { createPostRequest } from "@/app/_utils/createApiRequest";
import LoadingPage from "@/app/_components/LoadingPage";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import useAuth from "@/app/_hooks/useAuth";
import { Question } from "@prisma/client";

const Page: React.FC = () => {
  const id = "cm1dmmv0s0002dg0zwgbt5vna"; // TODO: デバッグ用
  const ep = `/api/v1/teacher/sessions/${id}`;
  const { data, mutate } =
    useAuthenticatedGetRequest<SessionEditableFields>(ep);
  const { apiRequestHeader } = useAuth();
  const dataRef = useRef<SessionEditableFields>();
  const nextQuestionIdNum = useRef(4);

  // prettier-ignore
  const postApiCaller = useMemo(() => createPostRequest<AddQuestionRequest, ApiResponse<QuestionEditableFields>>(),[]);

  //【再取得（再検証）】
  const revalidate = () => {
    dev.console.log("APIを叩いて再取得（再検証）");
    mutate(undefined);
  };

  //【設問の追加】
  const addQuestion = useCallback(async () => {
    // [POST] /api/v1/teacher/questions/new
    const ep = `/api/v1/teacher/questions/new`;
    const reqBody: AddQuestionRequest = addQuestionRequestSchema.parse({
      sessionId: data?.data?.id!,
      order: 1, // TODO: 仮
      title: `設問0${nextQuestionIdNum.current}`, // TODO: 仮
    });
    dev.console.log("■ >>> " + JSON.stringify(reqBody, null, 2));
    const res = await postApiCaller(ep, reqBody, apiRequestHeader);
    dev.console.log("■ <<< " + JSON.stringify(res, null, 2));

    const newQuestion = questionEditableFieldsSchema.parse(res.data!);
    const optimisticLatestData = produce(
      dataRef.current,
      (draft: Draft<SessionEditableFields>) => {
        draft.questions.push(newQuestion);
      }
    );
    mutate(
      new SuccessResponseBuilder<SessionEditableFields>(optimisticLatestData!)
        .setHttpStatus(StatusCodes.OK)
        .build(),
      false
    );
    nextQuestionIdNum.current++;
  }, [apiRequestHeader, data?.data?.id, mutate, postApiCaller]);

  if (!data) return <LoadingPage />;

  dataRef.current = sessionEditableFieldsSchema.parse(data.data);
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
        {dataRef.current.questions.map((question) => (
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
