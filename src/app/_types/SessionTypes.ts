import { z } from "zod";

// フロントエンド <-> WebAPI層 の DTO
// DB層の型定義（Prisma）のインポートは避けること
// つまり import { Role } from "@prisma/client"; はあえて使わない

///////////////////////////////////////////////////////////////

const requiredMsg = "必須入力の項目です。";
// export const AccessCodePattern = /^\d{3}-\d{4}$/;
export const isAccessCode = (value: string) => /^\d{3}-\d{4}$/.test(value);
export const isCUID = (value: string) => /^c[a-z0-9]{24}$/.test(value);

///////////////////////////////////////////////////////////////

export interface SessionSummary {
  id: string;
  title: string;
  teacherName: string; // *
  accessCode: string;
  isActive: boolean;
  enrollmentCount: number; // *
  questionsCount: number; // *
  updatedAt: Date;
  createdAt: Date;
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
    .refine((v) => v.length >= 3, {
      message:
        "必須入力項目です。前後の空白文字を除いて 3文字以上 を入力してください。",
    }),
});

///////////////////////////////////////////////////////////////

export interface UpdateSessionRequest {
  id: string;
  title?: string;
  isActive?: boolean;
}

export const updateSessionRequestSchema = z.object({
  id: z.string().refine(isCUID, {
    message: "Invalid CUID format.",
  }),
  title: z
    .string()
    .min(1, requiredMsg)
    .max(30, "30文字以内で入力してください。")
    .transform((v) => v.trim())
    .refine((v) => v.length >= 3, {
      message:
        "必須入力項目です。前後の空白文字を除いて 3文字以上 を入力してください。",
    })
    .optional(),
  isActive: z.boolean().optional(),
});

///////////////////////////////////////////////////////////////

export interface SessionEnrollmentResponse {
  id: string;
  title: string;
  accessCode: string;
}

///////////////////////////////////////////////////////////////

export interface AccessCode {
  accessCode: string;
}

export const accessCodeSchema = z.object({
  accessCode: z.string().refine(isAccessCode, {
    message: "NNN-NNNN の形式で入力してください。",
  }),
});
