"use client";
import React from "react";
import Link from "@/app/_components/elements/Link";
import PageTitle from "@/app/_components/elements/PageTitle";

const Page: React.FC = () => {
  return (
    <div>
      <PageTitle title="学生のトップページ" />
      <p>「学生」のためのトップページです。</p>

      <ul className="mt-4">
        <li>
          <Link href="/student/sessions" label="/student/sessions" />
        </li>
      </ul>
    </div>
  );
};

export default Page;
