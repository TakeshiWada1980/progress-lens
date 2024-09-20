// APIリクエスト・レスポンス関係
import { NextResponse, NextRequest } from "next/server";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import { v4 as uuid } from "uuid";

export const revalidate = 0; // キャッシュを無効化

// とりあえずここで型定義
export type Question = {
  id: string;
  title: string;
  options: Option[];
  defaultOptionId?: string;
  compareKey?: string;
};

export type Option = {
  id: string;
  questionId: string;
  title: string;
  compareKey?: string;
};

// [GET] /api/alpha/state-management
export const GET = async (req: NextRequest) => {
  const res: Question[] = [
    {
      id: "1",
      title: "設問1",
      defaultOptionId: "1-1",
      compareKey: uuid(),
      options: [
        { id: "1-1", title: "A", questionId: "1", compareKey: uuid() },
        { id: "1-2", title: "B", questionId: "1", compareKey: uuid() },
        { id: "1-3", title: "C", questionId: "1", compareKey: uuid() },
      ],
    },
    {
      id: "2",
      title: "設問2",
      defaultOptionId: "2-1",
      compareKey: uuid(),
      options: [
        { id: "2-1", title: "A", questionId: "2", compareKey: uuid() },
        { id: "2-2", title: "B", questionId: "2", compareKey: uuid() },
        { id: "2-3", title: "C", questionId: "2", compareKey: uuid() },
      ],
    },
    {
      id: "3",
      title: "設問3",
      defaultOptionId: "3-1",
      compareKey: uuid(),
      options: [
        { id: "3-1", title: "A", questionId: "3", compareKey: uuid() },
        { id: "3-2", title: "B", questionId: "3", compareKey: uuid() },
        { id: "3-3", title: "C", questionId: "3", compareKey: uuid() },
      ],
    },
  ];

  return NextResponse.json(
    new SuccessResponseBuilder<Question[]>(res)
      .setHttpStatus(StatusCodes.OK)
      .build()
  );
};
