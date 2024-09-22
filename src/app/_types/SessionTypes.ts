import { boolean, StringValidation, z } from "zod";

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

export interface SessionEditableFields {
  id: string;
  title: string;
  accessCode: string;
  isActive: boolean;
  teacherId: string;
  questions: QuestionEditFields[];
  compareKey?: string;
}

export interface QuestionEditFields {
  id: string;
  order: number;
  title: string;
  description: string;
  defaultOptionId: string;
  options: OptionEditFields[];
  compareKey?: string;
}

export interface OptionEditFields {
  id: string;
  questionId: string;
  order: number;
  title: string;
  description: string;
  rewardMessage: string;
  rewardPoint: number;
  effect: boolean;
  compareKey?: string;
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
    message: "NNN-NNNN の形式で入力してください（Nは半角数字）",
  }),
});

///////////////////////////////////////////////////////////////

export interface UpdateOptionRequest {
  id: string;
  title?: string;
  order?: number;
  description?: string;
  rewardMessage?: string;
  rewardPoint?: number;
  effect?: boolean;
}

export const updateOptionSchema = z.object({
  id: z.string().refine(isCUID, {
    message: "Invalid CUID format.",
  }),
  title: z
    .string()
    .min(1, requiredMsg)
    .max(30, "30文字以内で入力してください。")
    .transform((v) => v.trim())
    .refine((v) => v.length >= 2, {
      message: "前後の空白文字を除いて 2文字以上 を入力してください。",
    })
    .optional(),
  order: z.number().int().min(1, "1以上の整数を入力してください。").optional(),
  description: z.string().optional(),
  rewardMessage: z.string().optional(),
  rewardPoint: z
    .number()
    .int()
    .min(0, "0以上の整数を入力してください。")
    .optional(),
  effect: z.boolean().optional(),
});

///////////////////////////////////////////////////////////////

export interface UpdateQuestionRequest {
  id: string;
  title?: string;
  defaultOptionId?: string;
  description?: string;
}

export const updateQuestionSchema = z.object({
  id: z.string().refine(isCUID, {
    message: "Invalid CUID format.",
  }),
  title: z
    .string()
    .min(1, requiredMsg)
    .max(30, "30文字以内で入力してください。")
    .transform((v) => v.trim())
    .refine((v) => v.length >= 2, {
      message: "前後の空白文字を除いて 2文字以上 を入力してください。",
    })
    .optional(),
  defaultOptionId: z
    .string()
    .refine(isCUID, {
      message: "Invalid CUID format.",
    })
    .optional(),
  description: z.string().optional(),
});
