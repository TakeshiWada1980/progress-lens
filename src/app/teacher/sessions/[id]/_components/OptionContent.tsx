"use client";

import React, { useState, useRef, memo, useMemo, useCallback } from "react";
import { RenderCount } from "@/app/_components/elements/RenderCount";
import {
  SessionEditableFields,
  OptionEditableFields,
} from "@/app/_types/SessionTypes";
import dev from "@/app/_utils/devConsole";
import { produce, Draft } from "immer";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import { ApiResponse } from "@/app/_types/ApiResponse";
import {
  UpdateQuestionRequest,
  UpdateOptionRequest,
  optionTitleSchema,
} from "@/app/_types/SessionTypes";
import { createPutRequest } from "@/app/_utils/createApiRequest";
import useAuth from "@/app/_hooks/useAuth";
import {
  useExitInputOnEnter,
  INPUT_CANCELLED,
} from "@/app/_hooks/useExitInputOnEnter";
import { mutate } from "swr";
import { removeViewIdFromOptionEditableFields } from "../_helpers/propComparison";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import party from "party-js";
import TextInputField from "@/app/_components/elements/TextInputField";
import FormFieldErrorMsg from "@/app/_components/elements/FormFieldErrorMsg";
import { isDebugMode } from "@/config/app-config";

type Props = {
  option: OptionEditableFields;
  getOptimisticLatestData: () => SessionEditableFields | undefined;
  onUpdateDefaultOption: (req: UpdateQuestionRequest) => void;
  // isDragging: boolean;
};

const OptionContent: React.FC<Props> = memo(
  ({ option, getOptimisticLatestData, onUpdateDefaultOption }) => {
    const id = option.id;

    const [title, setTitle] = useState(option.title);
    const prevTitle = useRef(option.title);
    const [titleError, setTitleError] = useState<string | null>(null);

    const { apiRequestHeader } = useAuth();
    const exitInputOnEnter = useExitInputOnEnter();
    const sessionEp = `/api/v1/teacher/sessions/${
      getOptimisticLatestData()?.id
    }`;

    const rewardPoints = [0, 1, 2, 3];

    const isDefaultSelected =
      option.id ===
      getOptimisticLatestData()?.questions.find(
        (q) => q.id === option.questionId
      )?.defaultOptionId;

    // prettier-ignore
    const putApiCaller = useMemo(() => createPutRequest<UpdateOptionRequest, ApiResponse<null>>(),[]);

    //【回答選択肢タイトルの変更】
    const handleOptionTitleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        const zodResult = optionTitleSchema.safeParse(newTitle);
        setTitleError(
          zodResult.success ? null : zodResult.error.errors[0].message
        );
      },
      []
    );
    const updateTitle = useCallback(
      async (e: React.FocusEvent<HTMLInputElement, Element>) => {
        // ESCキーでキャンセルされた場合は
        // exitInputOnEnter 経由で INPUT_CANCELLED がセットされているはず
        if (e.target.value === INPUT_CANCELLED) {
          setTitle(prevTitle.current);
          setTitleError(null);
          return;
        }

        // バリデーション
        if (title === prevTitle.current) return;
        const zodResult = optionTitleSchema.safeParse(title);
        if (!zodResult.success) {
          setTitle(prevTitle.current);
          setTitleError(null);
          return;
        }
        setTitle(zodResult.data);
        prevTitle.current = zodResult.data;

        const optimisticLatestData = produce(
          getOptimisticLatestData(),
          (draft: Draft<SessionEditableFields>) => {
            const target = draft.questions
              .flatMap((q) => q.options)
              .find((o) => o.id === id);
            if (!target) throw new Error(`Option (id=${id}) not found.`);
            target.title = title;
          }
        );
        mutate(
          sessionEp,
          new SuccessResponseBuilder<SessionEditableFields>(
            optimisticLatestData!
          )
            .setHttpStatus(StatusCodes.OK)
            .build(),
          false
        );

        // バックエンド同期: 選択肢タイトル変更APIリクエスト
        const ep = `/api/v1/teacher/options/${id}/title`;
        const reqBody: UpdateOptionRequest = { id, title };
        dev.console.log("■ >>> " + JSON.stringify(reqBody, null, 2));
        const res = await putApiCaller(ep, reqBody, apiRequestHeader);
        dev.console.log("■ <<< " + JSON.stringify(res, null, 2));

        // mutate(sessionEp);
      },
      [
        title,
        getOptimisticLatestData,
        sessionEp,
        id,
        putApiCaller,
        apiRequestHeader,
      ]
    );

    //【既定の回答選択肢の変更】
    const changeDefaultOption = useCallback(
      async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
          onUpdateDefaultOption({
            id: option.questionId,
            defaultOptionId: option.id,
          });
        }
      },
      [onUpdateDefaultOption, option.questionId, option.id]
    );

    //【報酬ポイントの変更】
    const changeRewardPoint = useCallback(
      async (event: React.ChangeEvent<HTMLInputElement>) => {
        const rewardPoint = parseInt(event.target.value);
        // console.log("rewardPoint", rewardPoint);
        const optimisticLatestData = produce(
          getOptimisticLatestData(),
          (draft: Draft<SessionEditableFields>) => {
            const target = draft.questions
              .flatMap((q) => q.options)
              .find((o) => o.id === id);
            if (!target) throw new Error(`Option (id=${id}) not found.`);
            target.rewardPoint = rewardPoint;
          }
        );
        mutate(
          sessionEp,
          new SuccessResponseBuilder<SessionEditableFields>(
            optimisticLatestData!
          )
            .setHttpStatus(StatusCodes.OK)
            .build(),
          false
        );

        // バックエンド同期: 選択肢タイトル変更APIリクエスト
        const ep = `/api/v1/teacher/options/${id}/reward-point`;
        const reqBody: UpdateOptionRequest = { id, rewardPoint };
        dev.console.log("■ >>> " + JSON.stringify(reqBody, null, 2));
        const res = await putApiCaller(ep, reqBody, apiRequestHeader);
        dev.console.log("■ <<< " + JSON.stringify(res, null, 2));
      },
      [apiRequestHeader, getOptimisticLatestData, id, putApiCaller, sessionEp]
    );

    //【エフェクトの有効/無効の変更】
    const toggleEffect = useCallback(
      async (checked: boolean) => {
        const newState = !checked;

        const optimisticLatestData = produce(
          getOptimisticLatestData(),
          (draft: Draft<SessionEditableFields>) => {
            const target = draft.questions
              .flatMap((q) => q.options)
              .find((o) => o.id === id);
            if (!target) throw new Error(`Option (id=${id}) not found.`);
            target.effect = newState;
          }
        );
        mutate(
          sessionEp,
          new SuccessResponseBuilder<SessionEditableFields>(
            optimisticLatestData!
          )
            .setHttpStatus(StatusCodes.OK)
            .build(),
          false
        );

        // バックエンド同期: 選択肢エフェクト有無の変更APIリクエスト
        const ep = `/api/v1/teacher/options/${id}/effect`;
        const reqBody: UpdateOptionRequest = { id, effect: newState };
        dev.console.log("■ >>> " + JSON.stringify(reqBody, null, 2));
        const res = await putApiCaller(ep, reqBody, apiRequestHeader);
        dev.console.log("■ <<< " + JSON.stringify(res, null, 2));
      },
      [apiRequestHeader, getOptimisticLatestData, id, putApiCaller, sessionEp]
    );

    return (
      <div>
        <div className="items-start sm:flex">
          <div className="sm:grow">
            <TextInputField
              id={"option" + id}
              value={title}
              border="hoverOnly"
              className="px-1 py-0 placeholder:text-sm"
              placeholder="※※ この選択肢は非表示となります ※※"
              error={!!titleError}
              onChange={handleOptionTitleChange}
              onBlur={updateTitle}
              onKeyDown={exitInputOnEnter}
            />
            <FormFieldErrorMsg msg={titleError} />
          </div>

          <div className="ml-1 flex items-center space-x-2">
            <div className="text-sm">Reward</div>
            <div className="flex space-x-0.5">
              {rewardPoints.map((point) => (
                <div key={point} className="flex items-center">
                  <label
                    htmlFor={`reward-${point}-${id}`}
                    className="cursor-pointer"
                  >
                    <input
                      tabIndex={-1}
                      type="radio"
                      id={`reward-${point}-${id}`}
                      name={`reward-${id}`}
                      value={point}
                      defaultChecked={option.rewardPoint === point}
                      className="peer sr-only"
                      onChange={changeRewardPoint}
                    />
                    <div
                      className={twMerge(
                        "cursor-pointer rounded px-1 py-0 text-center text-xs",
                        "transition-colors duration-200 ease-in-out",
                        "bg-gray-300 text-white",
                        title.length === 0
                          ? "hover:bg-gray-400 peer-checked:bg-gray-400"
                          : "hover:bg-blue-400 peer-checked:bg-blue-500"
                      )}
                    >
                      {point}
                    </div>
                  </label>
                </div>
              ))}
            </div>

            <div>
              <label htmlFor={`effect-${id}`}>
                <input
                  tabIndex={-1}
                  type="checkbox"
                  id={`effect-${id}`}
                  className="peer sr-only"
                  defaultChecked={option.effect}
                  onChange={() => toggleEffect(option.effect)}
                />
                <div
                  className={twMerge(
                    "cursor-pointer text-sm",
                    "transition-colors duration-200 ease-in-out",
                    "text-gray-300",
                    title.length === 0
                      ? "hover:text-gray-400 peer-checked:text-gray-400"
                      : "hover:text-pink-300 peer-checked:text-pink-400"
                  )}
                  onMouseDown={() => {
                    if (!option.effect) {
                      party.confetti(document.getElementById(`effect-${id}`)!);
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faWandMagicSparkles} />
                </div>
              </label>
            </div>

            <div>/</div>

            <div className="flex items-center space-x-1 text-sm">
              <label className="cursor-pointer" htmlFor={option.id}>
                <input
                  tabIndex={-1}
                  type="radio"
                  id={option.id}
                  name={`${option.questionId}-default-option`}
                  value={option.id}
                  defaultChecked={isDefaultSelected}
                  className="peer sr-only"
                  onChange={changeDefaultOption}
                />
                <div
                  className={twMerge(
                    "cursor-pointer rounded px-1 py-0 text-center text-xs",
                    "transition-colors duration-200 ease-in-out",
                    "bg-gray-300 text-white",
                    title.length === 0
                      ? "hover:bg-gray-400 peer-checked:bg-gray-400"
                      : "hover:bg-blue-400 peer-checked:bg-blue-500"
                  )}
                >
                  Default
                </div>
              </label>
            </div>
          </div>
        </div>
        {isDebugMode && (
          <div className="flex items-center space-x-2">
            <RenderCount />
            <div className="text-xs text-blue-500">
              id=&quot;{option.id}&quot;
            </div>
            <div className="text-xs text-green-700">
              order=&quot;{option.order}&quot;
            </div>
          </div>
        )}
      </div>
    );
  },
  // カスタム比較関数
  (prevProps, nextProps) => {
    const p = removeViewIdFromOptionEditableFields(prevProps.option);
    const n = removeViewIdFromOptionEditableFields(nextProps.option);
    return JSON.stringify(p) === JSON.stringify(n);
  }
);

OptionContent.displayName = "OptionContent";

export default OptionContent;
