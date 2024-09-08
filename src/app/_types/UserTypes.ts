import { z } from "zod";

// フロントエンド <-> WebAPI層 の DTO
// DB層の型定義（Prisma）のインポートは避けること
// つまり import { Role } from "@prisma/client"; はあえて使わない

export const Role = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

///////////////////////////////////////////////////////////////

const requiredMsg = "必須入力の項目です。";
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

///////////////////////////////////////////////////////////////

export interface UserId {
  id: string;
}

export const userIdSchema = z.object({
  id: z.string().regex(uuidRegex, "不正な形式です。Invalid UUID format."),
});

///////////////////////////////////////////////////////////////

export interface UserNewRole {
  id: string;
  newRole: Role;
}

export const userNewRoleSchema = z.object({
  id: z.string().regex(uuidRegex, "不正な形式です。Invalid UUID format."),
  newRole: z.enum([Role.ADMIN, Role.TEACHER, Role.STUDENT]),
});

///////////////////////////////////////////////////////////////

export interface UserAuth {
  email: string;
  password: string;
}

export const userAuthSchema = z.object({
  email: z.string().email("メールアドレスの形式で入力してください。"),
  password: z.string().min(6, "パスワードには6文字以上が必要です。"),
});

///////////////////////////////////////////////////////////////

export interface UserProfile {
  id: string;
  role: Role;
  displayName: string;
  avatarImgKey?: string;
  avatarImgUrl?: string;
}

export const userProfileSchema = z.object({
  id: z
    .string()
    .regex(uuidRegex, "不正な形式です。Invalid UUID format.")
    .optional(),
  role: z.enum([Role.ADMIN, Role.TEACHER, Role.STUDENT]).optional(),
  displayName: z
    .string()
    .min(1, requiredMsg)
    .max(30, "30文字以内で入力してください。")
    .transform((v) => v.trim())
    .refine((val) => val.length >= 1, {
      message:
        "必須入力項目です。前後の空白文字を除いて 1文字以上 を入力してください。",
    })
    .optional(),
  avatarImgKey: z
    .string()
    .regex(/^private\/[a-f0-9]{32}$/, "Invalid avatarImgKey format")
    .optional(),
  avatarImgUrl: z.string().optional(),
});
