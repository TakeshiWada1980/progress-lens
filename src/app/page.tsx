"use client";
import React from "react";
import Image from "next/image";
import Link from "@/app/_components/elements/Link";
import PageTitle from "@/app/_components/elements/PageTitle";
import { appName } from "@/config/app-config";

const Home: React.FC = () => {
  return (
    <div>
      <Image
        src="/progress-lens.jpg"
        alt="Example Image"
        width={1024}
        height={512}
        priority
        className="mb-4 rounded-xl shadow-lg"
      />
      <ul>
        <li>
          <Link href="/signup" label="/signup" />
        </li>
        <li>
          <Link href="/login" label="/login" />
        </li>
        <li>
          <Link href="/user/profile" label="/user/profile" />
          &nbsp;(Login required)
        </li>
        <li>
          <Link href="/student" label="/student" />
          &nbsp;(Login required)
        </li>
        <li>
          <Link href="/teacher" label="/teacher" />
          &nbsp;(Login required - TEACHER, ADMIN only)
        </li>
        <li>
          <Link href="/admin" label="/admin" />
          &nbsp;(Login required - ADMIN only)
        </li>
      </ul>
    </div>
  );
};

export default Home;
