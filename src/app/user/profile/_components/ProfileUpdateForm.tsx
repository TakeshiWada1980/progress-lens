"use client";
import React, { ChangeEvent, useCallback, useEffect } from "react";
import { useWatch, useFormContext } from "react-hook-form";

// カスタムフック・APIリクエスト系
import { supabase } from "@/lib/supabase";

// UIコンポーネント
import FormFieldErrorMsg from "@/app/_components/elements/FormFieldErrorMsg";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/shadcn/ui/avatar";
import LoadingSpinner from "@/app/_components/elements/LoadingSpinner";
import TextInputField from "@/app/_components/elements/TextInputField";
import Link from "@/app/_components/elements/Link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faComment } from "@fortawesome/free-solid-svg-icons";
import ActionButton from "@/app/_components/elements/ActionButton";

// 型・定数・ユーティリティ
import { UserProfile } from "@/app/_types/UserTypes";
import { avatarBucket } from "@/config/app-config";
import { calculateMD5Hash } from "@/app/_utils/md5";
import { roleEnum2str } from "@/app/_utils/roleEnum2str";

interface Props {
  disabled: boolean;
  email?: string;
}

const ProfileUpdateForm: React.FC<Props> = ({ disabled, email }) => {
  const c_DisplayName = "displayName";
  const c_AvatarImgUrl = "avatarImgUrl";
  const c_AvatarImgKey = "avatarImgKey";
  const c_Role = "role";
  const c_Mail = "mail";

  const [isImgLoading, setIsImgLoading] = React.useState(false);

  const { register, setValue, control, formState } =
    useFormContext<UserProfile>();
  const errors = formState.errors;

  const avatarImageKey = useWatch({ name: c_AvatarImgKey, control });
  const avatarImageUrl = useWatch({ name: c_AvatarImgUrl, control });
  const roleValue = roleEnum2str(useWatch({ name: c_Role, control }));

  const updateAvatarUrl = useCallback(
    async (imageKey: string | undefined) => {
      if (!imageKey) return;
      const res = await supabase.storage
        .from(avatarBucket)
        .getPublicUrl(imageKey);
      setValue(c_AvatarImgUrl, res.data.publicUrl, { shouldValidate: true });
    },
    [setValue]
  );

  useEffect(() => {
    if (!avatarImageKey || avatarImageKey == "") {
      setValue(c_AvatarImgUrl, undefined, { shouldValidate: true });
      return;
    }
    updateAvatarUrl(avatarImageKey);
  }, [avatarImageKey, updateAvatarUrl, setValue]);

  const handleAvatarClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".jpg,.jpeg,.png";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        if (["jpg", "jpeg", "png"].includes(fileExtension || "")) {
          handleImageChange(
            e as unknown as React.ChangeEvent<HTMLInputElement>
          );
        } else {
          alert(
            "アバターに設定可能な画像ファイル形式は .jpg, .jpeg, .png のみです。"
          );
        }
      }
    };
    input.click();
  };

  const handleImageChange = async (
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImgLoading(true);
    const fileHash = await calculateMD5Hash(file);
    const filePath = `private/${fileHash}`;

    const { data, error } = await supabase.storage
      .from(avatarBucket)
      .upload(filePath, file, { cacheControl: "3600", upsert: true });

    setIsImgLoading(false);
    if (error) {
      alert(error.message);
      return;
    }

    setValue(c_AvatarImgKey, data.path, { shouldValidate: true });
  };

  const avatarDeleteAction = () => {
    setValue(c_AvatarImgKey, undefined, { shouldValidate: true });
  };

  return (
    <div>
      <div className="mb-6">
        <label
          htmlFor={c_DisplayName}
          className="mb-1 block font-bold text-gray-700"
        >
          DisplayName (表示名)
        </label>
        <TextInputField
          {...register(c_DisplayName)}
          id={c_DisplayName}
          type="text"
          placeholder="表示名 (DisplayName) を入力してください。"
          disabled={disabled}
          error={!!errors.displayName}
        />
        <FormFieldErrorMsg msg={errors.displayName?.message} />
      </div>

      <div className="mb-6">
        <label className="mb-1 block font-bold text-gray-700">
          アバター画像
        </label>

        <div className="flex items-baseline space-x-3">
          <div className="relative inline-block">
            <div
              className="cursor-pointer rounded-full border-2 border-gray-300 p-1 transition-colors hover:border-blue-500"
              onClick={handleAvatarClick}
            >
              <Avatar className="size-32">
                <AvatarImage src={avatarImageUrl} alt="プロフィール画像" />
                <AvatarFallback className="bg-gray-200 text-xl font-bold text-gray-600" />
              </Avatar>
            </div>
            <div
              className="absolute bottom-0 right-0 cursor-pointer rounded-full border-2 border-slate-300 bg-white px-2 py-1.5 shadow-md transition-colors hover:bg-gray-100"
              onClick={handleAvatarClick}
            >
              <FontAwesomeIcon
                icon={faCamera}
                className="text-xl text-gray-600"
              />
            </div>
          </div>
          <ActionButton
            tabIndex={-1}
            type="button"
            variant="delete"
            className="px-2 py-1 text-sm"
            onClick={avatarDeleteAction}
            disabled={disabled || !avatarImageKey}
          >
            削除
          </ActionButton>
        </div>

        {isImgLoading && (
          <LoadingSpinner message="アバター画像をアップロード中..." />
        )}
      </div>

      <div className="mb-6">
        <label htmlFor={c_Role} className="mb-1 block font-bold text-gray-700">
          Role
        </label>
        <TextInputField
          tabIndex={-1}
          id={c_Role}
          type="text"
          value={roleValue}
          placeholder="(自動取得されます)"
          readOnly
          disabled={disabled}
        />
      </div>

      <div className="mb-6">
        <label htmlFor={c_Mail} className="mb-1 block font-bold text-gray-700">
          メールアドレス（ログインID）
        </label>
        <TextInputField
          tabIndex={-1}
          id={c_Mail}
          type="text"
          value={email}
          placeholder="(自動取得されます)"
          readOnly
          disabled={disabled}
        />
      </div>

      {/* ファイル選択ボタン（デバッグ用・消すな!）*/}
      {/* <div className="mb-4 flex w-full flex-col md:flex-row">
        <div>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/png, image/jpeg"
          />
        </div>
      </div> */}

      {/* AvatarImgKey リリース時には hidden 属性を設定 */}
      <div className="mb-6">
        <label
          htmlFor={c_AvatarImgKey}
          className="mb-1 block font-bold text-gray-700"
        >
          AvatarImageKey (Debug)
        </label>
        <TextInputField
          tabIndex={-1}
          {...register(c_AvatarImgKey)}
          id={c_AvatarImgKey}
          type="text"
          placeholder="(アバター画像を選択すると自動取得されます)"
          readOnly
          disabled={disabled}
        />
      </div>

      {/* AvatarImgUrl リリース時には hidden 属性を設定 */}
      <div className="mb-6">
        <label
          htmlFor={c_AvatarImgUrl}
          className="mb-1 block font-bold text-gray-700"
        >
          AvatarImageUrl (Debug)
        </label>
        <TextInputField
          tabIndex={-1}
          {...register(c_AvatarImgUrl)}
          id={c_AvatarImgUrl}
          type="text"
          placeholder="(アバター画像を選択すると自動取得されます)"
          readOnly
          disabled={disabled}
        />
      </div>

      <div className="mb-6 space-y-2 break-all text-sm">
        <div>
          <FontAwesomeIcon
            icon={faComment}
            flip="horizontal"
            className="mr-1"
          />
          メールアドレス（ログインID）の変更は
          <Link href="/user/email" state="notImplemented">
            メールアドレスの変更
          </Link>
          から行ってください。
        </div>
        <div>
          <FontAwesomeIcon
            icon={faComment}
            flip="horizontal"
            className="mr-1"
          />
          パスワードの変更は
          <Link href="/user/password" state="notImplemented">
            パスワードの変更
          </Link>
          から行ってください。
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdateForm;
