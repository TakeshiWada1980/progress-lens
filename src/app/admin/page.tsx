"use client";
import React from "react";
import PageTitle from "@/app/_components/elements/PageTitle";
import Link from "@/app/_components/elements/Link";

const Page: React.FC = () => {
  return (
    <div>
      <PageTitle title="管理者のトップページ" />
      <p>「管理者」のためのトップページです。</p>

      <ul>
        <li>
          <Link href="/admin/assign-role" label="/admin/assign-role" />
        </li>
      </ul>
    </div>
  );
};

export default Page;
