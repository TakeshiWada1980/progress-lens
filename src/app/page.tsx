"use client";
import React from "react";
import Link from "@/app/_components/elements/Link";
import PageTitle from "@/app/_components/elements/PageTitle";
import { appName } from "@/config/app-config";

const Home: React.FC = () => {
  return (
    <div>
      <PageTitle
        title={`Visualize and Share Your Progress with ${appName}`}
        className="text-xl"
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
        <li>
          <Link
            href="/playground/state-management3"
            label="/playground/state-management3"
          />
        </li>
        <li>
          <Link
            href="/playground/state-management5"
            label="/playground/state-management5"
          />
        </li>
        <li>
          <Link
            href="/playground/state-management8"
            label="/playground/state-management8"
          />
        </li>
        <li>
          <Link
            href="/playground/state-management90"
            label="/playground/state-management90"
          />
        </li>
      </ul>
    </div>
  );
};

export default Home;
