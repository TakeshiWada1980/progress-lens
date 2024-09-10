import { z } from "zod";

// フロントエンド <-> WebAPI層 の DTO
// DB層の型定義（Prisma）のインポートは避けること
// つまり import { Role } from "@prisma/client"; はあえて使わない

///////////////////////////////////////////////////////////////

const requiredMsg = "必須入力の項目です。";
export const AccessCodePattern = /^\d{3}-\d{4}$/;

///////////////////////////////////////////////////////////////

export interface SessionSummary {
  id: string;
  title: string;
  teacherName: string;
  accessCode: string;
  isActive: boolean;
  enrollmentCount: number;
  updatedAt: Date;
}

///////////////////////////////////////////////////////////////

export interface CreateSessionRequest {
  title: string;
}

export const createSessionRequestSchema = z.object({
  title: z
    .string()
    .min(1, requiredMsg)
    .max(30, "30文字以内で入力してください。")
    .transform((v) => v.trim())
    .refine((val) => val.length >= 1, {
      message:
        "必須入力項目です。前後の空白文字を除いて 1文字以上 を入力してください。",
    }),
});
