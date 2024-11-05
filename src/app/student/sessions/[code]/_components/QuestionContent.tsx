"use client";
import React, {
  useState,
  useEffect,
  useRef,
  memo,
  useMemo,
  useCallback,
} from "react";

import { produce, Draft } from "immer";

// カスタムフック・APIリクエスト系
import { createPostRequest } from "@/app/_utils/createApiRequest";
import { mutate } from "swr";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import useAuth from "@/app/_hooks/useAuth";
import { ApiResponse } from "@/app/_types/ApiResponse";
import {
  PostResponseRequest,
  postResponseRequestSchema,
} from "@/app/_types/ResponseTypes";

// UIコンポーネント
import party from "party-js";
import { SessionSnapshot, QuestionSnapshot } from "@/app/_types/SessionTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleQuestion,
  faSquareCheck,
  faCaretRight,
} from "@fortawesome/free-solid-svg-icons";
import AnimatedProgressBar from "@/app/_components/elements/AnimatedProgressBar";
import { twMerge } from "tailwind-merge";

// 型・定数・ユーティリティ
import dev from "@/app/_utils/devConsole";

type Props = {
  question: QuestionSnapshot;
  getOptimisticLatestData: () => SessionSnapshot | undefined;
};

const QuestionContent: React.FC<Props> = memo(
  ({ question, getOptimisticLatestData }) => {
    const [animationTrigger, setAnimationTrigger] = useState(false);
    const sessionEp = `/api/v1/student/sessions/${
      getOptimisticLatestData()?.accessCode
    }`;

    const { apiRequestHeader } = useAuth();
    const isActiveSession = getOptimisticLatestData()?.isActive;
    const totalResponseCount = question.options.reduce(
      (acc, option) => acc + option.responseCount,
      0
    );

    // prettier-ignore
    const postApiCaller = useMemo(() => createPostRequest<PostResponseRequest, ApiResponse<null>>(),[]);

    const partyEffect = useCallback((id: string) => {
      party.confetti(document.getElementById(id)!);
    }, []);

    //【回答選択肢の変更】
    const changeResponse = useCallback(
      async (event: React.ChangeEvent<HTMLInputElement>) => {
        // セッションが無効な場合は何もしない
        if (!isActiveSession) return;

        const newResponseId = event.target.value;

        // 無効な選択肢の場合は何もしない
        const option = question.options.find((o) => o.id === newResponseId);
        if (!option || option.title === "") {
          dev.console.log("無効な選択肢です。");
          return;
        }

        const optimisticLatestData = produce(
          getOptimisticLatestData(),
          (draft: Draft<SessionSnapshot>) => {
            const target = draft.questions.find((q) => q.id === question.id);
            target!.options.forEach((option) => {
              if (option.isUserResponse) option.responseCount -= 1;
              option.isUserResponse = option.id === newResponseId;
              if (option.isUserResponse) option.responseCount += 1;
            });
          }
        );
        // 楽観的UI更新
        mutate(
          sessionEp,
          new SuccessResponseBuilder<SessionSnapshot>(optimisticLatestData!)
            .setHttpStatus(StatusCodes.OK)
            .build(),
          false
        );

        // プレビューモードの場合はバックエンド同期を行わない
        if (getOptimisticLatestData()?.previewMode) return;

        // バックエンド同期:
        const ep = `/api/v1/student/questions/${question.id}`;
        const reqBody: PostResponseRequest = postResponseRequestSchema.parse({
          questionId: question.id,
          optionId: newResponseId,
        });
        dev.console.log("■ >>> " + JSON.stringify(reqBody, null, 2));
        const res = await postApiCaller(ep, reqBody, apiRequestHeader);
        dev.console.log("■ <<< " + JSON.stringify(res, null, 2));

        // mutate(sessionEp);
      },
      [
        apiRequestHeader,
        getOptimisticLatestData,
        isActiveSession,
        postApiCaller,
        question.id,
        question.options,
        sessionEp,
      ]
    );

    // アニメーション関連
    const handleVisibilityChange = useCallback(() => {
      if (document.visibilityState === "visible") {
        setAnimationTrigger((prev) => !prev);
      }
    }, []);
    useEffect(() => {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      //prettier-ignore
      return () => document.removeEventListener("visibilitychange",handleVisibilityChange);
    }, [handleVisibilityChange]);

    return (
      <div className="rounded border border-pink-200 bg-pink-50 p-2 pt-1 text-pink-800 drop-shadow">
        <div className="mb-1 flex items-start text-lg font-bold ">
          <div>
            <FontAwesomeIcon icon={faCircleQuestion} className="mr-1" />
          </div>
          <div>{question.title}</div>
        </div>
        <div className="space-y-2.5 rounded bg-white p-2">
          {question.options.map(
            (option) =>
              option.title !== "" && (
                <div key={option.id} className="">
                  <div className="flex items-center justify-between ">
                    <label>
                      <div
                        className={twMerge(
                          "flex cursor-pointer items-center",
                          !isActiveSession && "cursor-not-allowed"
                        )}
                        onMouseDown={() => {
                          option.effect && partyEffect(option.id);
                        }}
                      >
                        <input
                          tabIndex={-1}
                          id={option.id}
                          type="radio"
                          name={question.id}
                          value={option.id}
                          defaultChecked={option.isUserResponse}
                          className={twMerge("peer sr-only")}
                          onChange={changeResponse}
                          disabled={!isActiveSession}
                          onKeyDown={(e) => {
                            // 矢印キーとスペースキーの操作を無効化
                            if (
                              e.key === "ArrowUp" ||
                              e.key === "ArrowDown" ||
                              e.key === "ArrowLeft" ||
                              e.key === "ArrowRight" ||
                              e.key === " "
                            ) {
                              e.preventDefault();
                            }
                          }}
                        />

                        <div
                          className={twMerge(
                            "mr-1.5 ",
                            "transition-colors duration-200 ease-in-out",
                            "text-gray-300",
                            option.isUserResponse &&
                              "peer-checked:text-pink-400",
                            option.isUserResponse &&
                              !isActiveSession &&
                              "peer-checked:text-gray-500"
                          )}
                        >
                          <FontAwesomeIcon icon={faSquareCheck} />
                        </div>

                        <div
                          className={twMerge(
                            option.isUserResponse && "font-bold text-pink-900"
                          )}
                        >
                          {option.title}
                        </div>

                        {option.isUserResponse && option.rewardPoint > 0 && (
                          <div className="ml-1.5 text-xs">
                            (+{option.rewardPoint}pt)
                          </div>
                        )}

                        {option.id === question.defaultOptionId && (
                          <div
                            className={twMerge(
                              "ml-1.5 rounded px-1 py-0 text-center text-xs",
                              "bg-pink-300 text-white"
                            )}
                          >
                            Default
                          </div>
                        )}
                      </div>
                    </label>
                    <div
                      className={twMerge(
                        "mr-1",
                        option.isUserResponse && "font-bold"
                      )}
                    >
                      {option.isUserResponse && (
                        <FontAwesomeIcon
                          icon={faCaretRight}
                          className="mr-1.5"
                        />
                      )}
                      {option.responseCount}
                    </div>
                  </div>
                  <div className="ml-4">
                    <AnimatedProgressBar
                      value={option.responseCount}
                      max={totalResponseCount}
                      animationTrigger={animationTrigger}
                      color1={isActiveSession ? "bg-pink-300" : "bg-gray-500"}
                      color2={isActiveSession ? "bg-pink-50" : "bg-gray-500"}
                    />
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    );
  }
);

QuestionContent.displayName = "QuestionContent";

export default QuestionContent;
