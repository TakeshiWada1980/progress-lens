"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import PageTitle from "@/app/_components/elements/PageTitle";
import QuestionView from "./_components/QuestionView";
import { produce, Draft } from "immer";
import { Question, EditSessionActions } from "./_types/types";
import { BackendSyncContext } from "./_hooks/useBackendSync";
import { v4 as uuid } from "uuid";
import dev from "@/app/_utils/devConsole";

const Page: React.FC = () => {
  // prettier-ignore
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", title: "設問1", defaultOptionId:"1-1", compareKey: uuid(), 
      options: [{id:"1-1",title:"A",questionId:"1"},{id:"1-2",title:"B",questionId:"1"}, {id:"1-3",title:"C",questionId:"1"}]},
    { id: "2", title: "設問2", defaultOptionId:"2-1", compareKey: uuid(),
      options: [{id:"2-1",title:"A",questionId:"2"},{id:"2-2",title:"B",questionId:"2"}, {id:"2-3",title:"C",questionId:"2"}]},
    { id: "3", title: "設問3", defaultOptionId:"3-1", compareKey: uuid(),
      options: [{id:"3-1",title:"A",questionId:"3"},{id:"3-2",title:"B",questionId:"3"}, {id:"3-3",title:"C",questionId:"3"}]},
  ]);
  const nextQuestionIdNum = useRef(4);

  // optimisticSession は、子コンポーネントの楽観的UI更新と同期をとっているもの
  // setSession(optimisticSession) は、全ての子コンポーネントで再レンダリングが必要なときに実行する
  const optimisticSession = useRef<Question[]>([...questions]);

  const reRender = useCallback(() => {
    dev.console.log(JSON.stringify(optimisticSession, null, 2));
    setQuestions(optimisticSession.current);
  }, []);

  // フロントエンドとバックエンドの同期処理は、このPageコンポーネントで実施する
  // 以下、EditSessionActions で定義された各関数の実装
  const updateQuestionTitle = useCallback(async (id: string, title: string) => {
    optimisticSession.current = produce(
      optimisticSession.current,
      (draft: Draft<Question[]>) => {
        const target = draft.find((question) => question.id === id);
        if (!target) throw new Error(`Question (id=${id}) not found.`);
        target.title = title;
        target.compareKey = uuid();
      }
    );
    // [PUT] /api/v1/teacher/questions/[id]/title
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Dummy
    // 通信負荷・描画負荷の軽減のために基本的に再検証はしない（各コンポーネントの楽観的UI更新を信頼）
  }, []);

  const updateOptionTitle = useCallback(async (id: string, title: string) => {
    optimisticSession.current = produce(
      optimisticSession.current,
      (draft: Draft<Question[]>) => {
        const target = draft.flatMap((q) => q.options).find((o) => o.id === id);
        if (!target) throw new Error(`Option (id=${id}) not found.`);
        target.title = title;
        target.compareKey = uuid();
      }
    );
    // [PUT] /api/v1/teacher/options/[id]/title
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }, []);

  const changeDefaultOption = useCallback(
    async (questionId: string, optionId: string) => {
      optimisticSession.current = produce(
        optimisticSession.current,
        (draft: Draft<Question[]>) => {
          const target = draft.find((q) => q.id === questionId);
          if (!target)
            throw new Error(`Question (id=${questionId}) not found.`);
          target.defaultOptionId = optionId;
          target.compareKey = uuid();
        }
      );
      // [PUT] /api/v1/teacher/options/[id]/default-option
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
    []
  );

  const deleteQuestion = useCallback(
    async (id: string) => {
      optimisticSession.current = produce(
        optimisticSession.current,
        (draft: Draft<Question[]>) => {
          const index = draft.findIndex((q) => q.id === id);
          if (index === -1) throw new Error(`Question (id=${id}) not found.`);
          draft.splice(index, 1);
        }
      );
      // この処理は楽観的UI更新（＝子コンポーネント自身によるUI更新）が不可能なため
      // setQuestions の実行により、全ての子コンポーネントを再レンダリングしてUIを更新
      setQuestions(optimisticSession.current);

      // [DELETE] /api/v1/teacher/questions/[id]
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Dummy
    },
    [setQuestions]
  );

  const addQuestion = useCallback(async () => {
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
    nextQuestionIdNum.current++;
    optimisticSession.current = produce(
      optimisticSession.current,
      (draft: Draft<Question[]>) => {
        draft.push(newQuestion);
      }
    );
    setQuestions(optimisticSession.current);

    // [POST] /api/v1/teacher/sessions/[id]/add-question
    // 本来は、設問IDはバックエンドで生成するべきものなので、ここではAPIを叩いて、
    // レスを受け取り、optimisticSession.current = produce(...) して
    // setQuestions(optimisticSession.current) を実行する
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Dummy
  }, [setQuestions]);

  const editActions: EditSessionActions = useMemo(
    () => ({
      updateQuestionTitle,
      updateOptionTitle,
      changeDefaultOption,
      deleteQuestion,
      addQuestion,
    }),
    // prettier-ignore
    [updateQuestionTitle,updateOptionTitle,changeDefaultOption,deleteQuestion,addQuestion,]
  );

  return (
    <div>
      <PageTitle title="状態管理に関する実験" className="mb-6" />

      <div className="mb-4 flex space-x-4">
        <button
          className="rounded-md border px-3 py-1 text-sm"
          onClick={editActions.addQuestion}
        >
          設問追加
        </button>

        <button
          className="rounded-md border px-3 py-1 text-sm"
          onClick={reRender}
        >
          強制・再レンダリング
        </button>
      </div>

      <BackendSyncContext.Provider value={editActions}>
        {questions.map((question) => (
          <QuestionView key={question.id} question={question} />
        ))}
      </BackendSyncContext.Provider>
    </div>
  );
};

export default Page;
