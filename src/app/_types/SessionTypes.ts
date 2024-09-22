import exp from "constants";
import { boolean, StringValidation, z } from "zod";

// フロントエンド <-> WebAPI層 の DTO
// DB層の型定義（Prisma）のインポートは避けること
// つまり import { Role } from "@prisma/client"; はあえて使わない

///////////////////////////////////////////////////////////////

const requiredMsg = "必須入力の項目です。";
// export const AccessCodePattern = /^\d{3}-\d{4}$/;

// prettier-ignore
export const isUUID = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export const isCUID = (value: string) => /^c[a-z0-9]{24}$/.test(value);
export const isAccessCode = (value: string) => /^\d{3}-\d{4}$/.test(value);

const cuidSchema = z.string().refine(isCUID, {
  message: "Invalid CUID format.",
});

const uuidSchema = z.string().refine(isUUID, {
  message: "Invalid UUID format.",
});

const accessCodeSchema = z.string().refine(isAccessCode, {
  message:
    "Invalid AccessCode format. NNN-NNNN の形式が必要です（Nは半角数字）",
});

const sessionTitleSchema = z
  .string()
  .trim()
  .min(2, "2文字以上16文字以内で入力してください。")
  .max(16, "2文字以上16文字以内で入力してください。");

const questionTitleSchema = z
  .string()
  .trim()
  .min(2, "2文字以上32文字以内で入力してください。")
  .max(32, "2文字以上32文字以内で入力してください。");

const optionTitleSchema = z
  .string()
  .trim()
  .min(2, "2文字以上16文字以内で入力してください。")
  .max(16, "2文字以上16文字以内で入力してください。");

// const accessCodeSchema = z.string().refine(isAccessCode, {
//   message: "NNN-NNNN の形式で入力してください（Nは半角数字）",
// });

// accessCode: z.string().refine(isAccessCode, {
//   message: "NNN-NNNN の形式で入力してください（Nは半角数字）",
// }),
const orderSchema = z.number().int().min(1, "1以上の整数を入力してください。");
const rewardPointSchema = z
  .number()
  .int()
  .min(0, "0以上の整数を入力してください。");
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

// export interface QuestionEditableFields {
//   id: string;
//   order: number;
//   title: string;
//   description: string;
//   defaultOptionId: string;
//   options: OptionEditableFields[];
//   compareKey?: string;
// }

// export interface OptionEditableFields {
//   id: string;
//   questionId: string;
//   order: number;
//   title: string;
//   description: string;
//   rewardMessage: string;
//   rewardPoint: number;
//   effect: boolean;
//   compareKey?: string;
// }

export const optionEditableFieldsSchema = z.object({
  id: cuidSchema,
  questionId: cuidSchema,
  order: orderSchema,
  title: optionTitleSchema,
  description: z.string(),
  rewardMessage: z.string(),
  rewardPoint: rewardPointSchema,
  effect: z.boolean(),
  compareKey: z.string().optional(),
});

export type OptionEditableFields = z.infer<typeof optionEditableFieldsSchema>;

export const questionEditableFieldsSchema = z.object({
  id: cuidSchema,
  order: orderSchema,
  title: questionTitleSchema,
  description: z.string(),
  defaultOptionId: cuidSchema,
  compareKey: z.string().optional(),
  options: z.array(optionEditableFieldsSchema),
});

export type QuestionEditableFields = z.infer<
  typeof questionEditableFieldsSchema
>;

// export interface SessionEditableFields {
//   id: string;
//   title: string;
//   accessCode: string;
//   isActive: boolean;
//   teacherId: string;
//   questions: QuestionEditableFields[];
//   compareKey?: string;
// }

export const sessionEditableFieldsSchema = z.object({
  id: cuidSchema,
  title: sessionTitleSchema,
  accessCode: accessCodeSchema,
  isActive: z.boolean(),
  teacherId: uuidSchema,
  compareKey: z.string().optional(),
  questions: z.array(questionEditableFieldsSchema),
});

export type SessionEditableFields = z.infer<typeof sessionEditableFieldsSchema>;

///////////////////////////////////////////////////////////////

// export interface CreateSessionRequest {
//   title: string;
// }

export const createSessionRequestSchema = z.object({
  title: sessionTitleSchema,
});

export type CreateSessionRequest = z.infer<typeof createSessionRequestSchema>;

///////////////////////////////////////////////////////////////

// export interface UpdateSessionRequest {
//   id: string;
//   title?: string;
//   isActive?: boolean;
// }

export const updateSessionRequestSchema = z.object({
  id: cuidSchema,
  title: sessionTitleSchema.optional(),
  isActive: z.boolean().optional(),
});

export type UpdateSessionRequest = z.infer<typeof updateSessionRequestSchema>;

///////////////////////////////////////////////////////////////

export interface SessionEnrollmentResponse {
  id: string;
  title: string;
  accessCode: string;
}

///////////////////////////////////////////////////////////////

// export interface AccessCode {
//   accessCode: string;
// }

export const accessCodeObjSchema = z.object({
  accessCode: accessCodeSchema,
});

export type AccessCode = z.infer<typeof accessCodeObjSchema>;

///////////////////////////////////////////////////////////////

export const addQuestionRequestSchema = z.object({
  sessionId: cuidSchema,
  title: questionTitleSchema.optional(),
  order: orderSchema.optional(),
});

export type AddQuestionRequest = z.infer<typeof addQuestionRequestSchema>;

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
