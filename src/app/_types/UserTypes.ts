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

export const RoleUpgradeRequestState = {
  NONE: "NONE",
  PENDING: "PENDING",
  REJECTED: "REJECTED",
  INELIGIBLE: "INELIGIBLE",
} as const;

export type RoleUpgradeRequestState =
  (typeof RoleUpgradeRequestState)[keyof typeof RoleUpgradeRequestState];

///////////////////////////////////////////////////////////////

// prettier-ignore
export const isImageKey = (value: string) => /^private\/[a-f0-9]{32}$/.test(value);
export const imageKeySchema = z.string().refine(isImageKey, {
  message: "Invalid imageKey format.",
});

// prettier-ignore
export const isUUID = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export const uuidSchema = z.string().refine(isUUID, {
  message: "Invalid UUID format.",
});

const userRoleSchema = z.enum([Role.ADMIN, Role.TEACHER, Role.STUDENT]);
const userRoleUpgradeRequestStatSchema = z.enum([
  RoleUpgradeRequestState.NONE,
  RoleUpgradeRequestState.PENDING,
  RoleUpgradeRequestState.REJECTED,
  RoleUpgradeRequestState.INELIGIBLE,
]);

///////////////////////////////////////////////////////////////

export const userIdSchema = z.object({
  id: uuidSchema,
});

export type UserId = z.infer<typeof userIdSchema>;

///////////////////////////////////////////////////////////////

export const userNewRoleSchema = z.object({
  id: uuidSchema,
  newRole: userRoleSchema,
});

export type UserNewRole = z.infer<typeof userNewRoleSchema>;

///////////////////////////////////////////////////////////////

export const userAuthSchema = z.object({
  email: z.string().email("メールアドレスの形式で入力してください。"),
  password: z.string().min(6, "パスワードには6文字以上が必要です。"),
});

export type UserAuth = z.infer<typeof userAuthSchema>;

///////////////////////////////////////////////////////////////

export interface UserProfile {
  id: string;
  role: Role;
  displayName: string;
  avatarImgKey?: string;
  avatarImgUrl?: string;
  provider?: string;
  isGuest?: boolean;
  roleUpgradeRequest?: RoleUpgradeRequestState;
}

export const userProfileSchema = z.object({
  id: uuidSchema.optional(),
  role: userRoleSchema.optional(),
  displayName: z
    .string()
    .trim()
    .min(1, "1文字以上16文字以内で入力してください。")
    .max(16, "1文字以上16文字以内で入力してください。")
    .optional(),
  avatarImgKey: imageKeySchema.optional(),
  avatarImgUrl: z.string().optional(),
  provider: z.string().optional(),
  isGuest: z.boolean().optional(),
  roleUpgradeRequestState: userRoleUpgradeRequestStatSchema.optional(),
});
