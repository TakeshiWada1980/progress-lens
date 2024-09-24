import { uuidSchema } from "@/app/_types/UserTypes";
import { z } from "zod";
import { optionSetSize } from "@/config/app-config";

// フロントエンド <-> WebAPI層 の DTO
// DB層の型定義（Prisma）のインポートは避けること
// つまり import { Role } from "@prisma/client"; はあえて使わない

///////////////////////////////////////////////////////////////

export const isCUID = (value: string) => /^c[a-z0-9]{24}$/.test(value);
export const isAccessCode = (value: string) => /^\d{3}-\d{4}$/.test(value);

const cuidSchema = z.string().refine(isCUID, {
  message: "Invalid CUID format.",
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
  .min(0, "0文字以上16文字以内で入力してください。")
  .max(16, "2文字以上16文字以内で入力してください。");

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

export const optionEditableFieldsSchema = z.object({
  id: cuidSchema,
  viewId: z.number().optional(),
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
  viewId: z.number().optional(),
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

export const createSessionRequestSchema = z.object({
  title: sessionTitleSchema,
});

export type CreateSessionRequest = z.infer<typeof createSessionRequestSchema>;

///////////////////////////////////////////////////////////////

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

export const updateOptionSchema = z.object({
  id: cuidSchema,
  title: optionTitleSchema.optional(),
  order: orderSchema.optional(),
  description: z.string().optional(),
  rewardMessage: z.string().optional(),
  rewardPoint: rewardPointSchema.optional(),
  effect: z.boolean().optional(),
});

export type UpdateOptionRequest = z.infer<typeof updateOptionSchema>;

///////////////////////////////////////////////////////////////

export const updateQuestionSchema = z.object({
  id: cuidSchema,
  title: questionTitleSchema.optional(),
  defaultOptionId: cuidSchema.optional(),
  description: z.string().optional(),
});

export type UpdateQuestionRequest = z.infer<typeof updateQuestionSchema>;

///////////////////////////////////////////////////////////////

export const updateQuestionsOrderSchema = z.object({
  data: z.array(
    z.object({
      questionId: cuidSchema,
      order: orderSchema,
    })
  ),
});

export type UpdateQuestionsOrderRequest = z.infer<
  typeof updateQuestionsOrderSchema
>;

export const updateOptionsOrderSchema = z.object({
  data: z
    .array(
      z.object({
        optionId: cuidSchema,
        order: orderSchema,
      })
    )
    .length(optionSetSize),
});

export type UpdateOptionsOrderRequest = z.infer<
  typeof updateOptionsOrderSchema
>;
