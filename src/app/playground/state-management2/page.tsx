"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import PageTitle from "@/app/_components/elements/PageTitle";
import QuestionView from "./_components/QuestionView";
import { produce, Draft } from "immer";
import useAuthenticatedGetRequest from "@/app/_hooks/useAuthenticatedGetRequest";
import { v4 as uuid } from "uuid";
import dev from "@/app/_utils/devConsole";
import LoadingSpinner from "@/app/_components/elements/LoadingSpinner";
import { Question } from "./_types/types";
import LoadingPage from "@/app/_components/LoadingPage";

const Page: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);

  const ep = "/api/alpha/state-management";
  const { data, mutate } = useAuthenticatedGetRequest<Question[]>(ep);

  if (!data?.data) return <LoadingPage />;
  const questions = data.data;

  return (
    <div>
      {questions.map((question) => (
        <QuestionView key={question.id} question={question} />
      ))}
    </div>
  );
};

export default Page;
