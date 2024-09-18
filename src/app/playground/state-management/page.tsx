"use client";

import React, { useState, useRef } from "react";
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

  // optimisticSession は、子コンポーネントにおける楽観的更新と同期をとっているもの
  // setSession(optimisticSession) は、全ての子コンポーネントで再レンダリングが必要なときに発動
  const optimisticSession = useRef<Question[]>([...questions]);

  // バックエンドとの同期は全てココで実行する
  const editActions: EditSessionActions = {
    // 設問タイトルの更新
    updateQuestionTitle: async (id, title) => {
      optimisticSession.current = produce(
        optimisticSession.current,
        (draft: Draft<Question[]>) => {
          const target = draft.find((question) => question.id === id);
          if (!target) throw new Error(`Question (id=${id}) not found.`);
          target.title = title;
          target.compareKey = uuid();
        }
      );
      // dummy 実際はここでバックエンドに送信
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
    // 選択肢タイトルの更新
    updateOptionTitle: async (id, title) => {
      optimisticSession.current = produce(
        optimisticSession.current,
        (draft: Draft<Question[]>) => {
          const option = draft
            .flatMap((q) => q.options)
            .find((o) => o.id === id);
          if (!option) throw new Error(`Option (id=${id}) not found.`);
          option.title = title;
          option.compareKey = uuid();
        }
      );
      // dummy 実際はここでバックエンドに送信
      await new Promise((resolve) => setTimeout(resolve, 2000)); //dummy
    },

    changeDefaultOption: async (questionId, optionId) => {
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
      await new Promise((resolve) => setTimeout(resolve, 2000)); //dummy
    },

    deleteQuestion: async (id) => {
      optimisticSession.current = produce(
        optimisticSession.current,
        (draft: Draft<Question[]>) => {
          const index = draft.findIndex((q) => q.id === id);
          if (index === -1) throw new Error(`Question (id=${id}) not found.`);
          draft.splice(index, 1);
        }
      );
      // この処理は楽観的UI更新（＝子コンポーネント自身によるUI更新）ができないため
      // setQuestions を更新して全ての子コンポーネントを再レンダリングすることでUIを更新
      setQuestions(optimisticSession.current);
      await new Promise((resolve) => setTimeout(resolve, 2000)); //dummy
    },

    addQuestion: async () => {
      const newQuestion: Question = {
        id: String(nextQuestionIdNum.current),
        title: `設問${nextQuestionIdNum.current}`,
        // prettier-ignore
        options: [
          { id: `${nextQuestionIdNum.current}-1`, title: "A", questionId: String(nextQuestionIdNum.current) },
          { id: `${nextQuestionIdNum.current}-2`, title: "B", questionId: String(nextQuestionIdNum.current) },
          { id: `${nextQuestionIdNum.current}-3`, title: "C", questionId: String(nextQuestionIdNum.current) },
        ],
      };
      nextQuestionIdNum.current++;
      optimisticSession.current = produce(
        optimisticSession.current,
        (draft: Draft<Question[]>) => {
          draft.push(newQuestion);
        }
      );
      // この処理は楽観的UI更新（＝子コンポーネント自身によるUI更新）ができないため
      // setQuestions を更新して全ての子コンポーネントを再レンダリングすることでUIを更新
      setQuestions(optimisticSession.current);
      await new Promise((resolve) => setTimeout(resolve, 2000)); //dummy
    },
  };

  return (
    <div>
      <PageTitle title="状態管理に関する実験" className="mb-6" />

      <BackendSyncContext.Provider value={editActions}>
        {questions.map((question) => (
          <QuestionView key={question.id} question={question} />
        ))}
      </BackendSyncContext.Provider>

      <button
        className="rounded-md border px-3 py-1 text-sm"
        onClick={editActions.addQuestion}
      >
        設問追加
      </button>
    </div>
  );
};

export default Page;
