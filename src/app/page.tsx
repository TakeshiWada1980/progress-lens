"use client";
import React from "react";
import Image from "next/image";
import Link from "@/app/_components/elements/Link";

import useAuth from "@/app/_hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faCaretRight,
  faThumbsUp,
  faCrow,
  faUser,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

const Home: React.FC = () => {
  const { session } = useAuth();

  return (
    <div className={twMerge("mb-10", !session && "-mt-5")}>
      <Image
        src="/progress-lens.jpg"
        alt="CoverImage"
        width={1024}
        height={425}
        priority
        className="mb-4 rounded-xl shadow-lg"
      />

      <h2 className="flex items-center text-lg font-bold">
        <div className="mb-1">みんなの「学び」が、つながる場所</div>
        <div className="ml-1 w-10 border-b-2 border-black pt-0.5"></div>
      </h2>
      <h1 className="mx-3 mb-1.5 text-4xl font-bold md:mx-6">
        ProgressLens
        <span className="ml-2 rounded-full bg-indigo-50 px-3 py-1 text-base text-indigo-500">
          ベータ版
          <FontAwesomeIcon
            icon={faCrow}
            flip="horizontal"
            className="ml-1 text-indigo-400"
          />
        </span>
      </h1>

      <div className="mx-3 mb-4 text-sm font-bold italic text-slate-400 md:mx-6">
        学びの状況（進捗や理解度など）を匿名性を保ちながら可視化して相互シェア
        <FontAwesomeIcon icon={faShareNodes} className="ml-1.5" />
      </div>

      <div className="mb-4 flex justify-center space-x-2.5 text-sm font-bold  text-indigo-800">
        <div className="rounded-md border-2 border-indigo-800 px-4 py-0.5 hover:bg-indigo-800 hover:text-white">
          <Link href="/login" style="unstyled">
            ProgressLens に ログイン
          </Link>
        </div>
        <div className="rounded-md border-2 border-indigo-800 px-4 py-0.5 hover:bg-indigo-800 hover:text-white">
          <Link href="/signup" style="unstyled">
            サインアップ
          </Link>
        </div>
      </div>

      <h3>
        <div className="flex items-center text-xl font-bold text-indigo-800">
          <FontAwesomeIcon icon={faComments} className="mr-2" />
          授業での活用
        </div>
      </h3>
      <div className="mb-4 mt-3">
        <div className="mb-2 ml-1">
          授業の「理解度」や演習の「進み具合」を準リアルタイムに可視化し、
          <span className="font-bold">
            クラス全体の傾向と分布に基づいた授業展開
          </span>
          を可能にします。
        </div>

        <div className="my-2 ml-3 space-y-2 text-sm">
          <p>
            <FontAwesomeIcon
              icon={faThumbsUp}
              className="mr-2 text-indigo-700"
            />
            進捗に応じて最適なタイミングでヒントを提示
          </p>
          <p>
            <FontAwesomeIcon
              icon={faThumbsUp}
              className="mr-2 text-indigo-700"
            />
            状況を可視化して授業のペースと解説を最適化
          </p>
          <p>
            <FontAwesomeIcon
              icon={faThumbsUp}
              className="mr-2 text-indigo-700"
            />
            匿名型だから心理的負担なく学びの状況を共有可能
          </p>
          <p>
            <FontAwesomeIcon
              icon={faThumbsUp}
              className="mr-2 text-indigo-700"
            />
            サイレントマジョリティの声を授業に反映
          </p>
        </div>

        <div className="mb-2 ml-1">
          次のような形式の授業で効果的に活用いただけます。
        </div>

        <div className="mb-2 ml-3 space-y-2 text-sm">
          <div>
            <div>
              <p className="leading-relaxed">
                <FontAwesomeIcon
                  icon={faThumbsUp}
                  className="mr-2 text-indigo-700 "
                />
                セルフペースド学習(
                <span className="font-bold text-indigo-500">※</span>
                )を主体とする授業
              </p>
            </div>
            <div className="ml-3">
              <span className="mr-0.5 font-bold text-indigo-500">※</span>
              学習者のペースで自律的に学ぶ方式。
              <Link href="https://www.google.com/search?q=自己調整学習">
                自己調整学習
              </Link>
              。
            </div>
          </div>
          <p>
            <FontAwesomeIcon
              icon={faThumbsUp}
              className="mr-2 text-indigo-700"
            />
            アクティブラーニング。オンライン授業。
          </p>
        </div>

        <div className="mb-2 ml-1">
          授業中の発言やリアクションが少ないクラスにおいても有効活用いただけます。
        </div>

        <div className="mb-4 mt-3 px-2 md:px-4">
          <div className="flex flex-col items-center justify-center gap-2 md:flex-row">
            <div className="w-full md:w-1/2">
              <div className="text-lg font-bold text-indigo-700 md:text-base">
                <FontAwesomeIcon icon={faUser} className="mr-1" />
                学生モードの画面
              </div>
              <Image
                src="/sp-student01.png"
                alt="Student Image"
                width={450}
                height={920}
                priority
                className="h-auto w-full"
              />
            </div>

            <div className="w-full md:w-1/2">
              <div className="text-xl font-bold text-indigo-700 md:text-base">
                <FontAwesomeIcon icon={faUser} className="mr-1" />
                教員モードの画面
              </div>
              <Image
                src="/sp-teacher01.png"
                alt="Teacher Image"
                width={450}
                height={920}
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>

        <div className="mb-3 ml-5 space-y-2 text-sm">
          <p>
            <FontAwesomeIcon
              icon={faCaretRight}
              className="mr-2 text-gray-500"
            />
            教員は、設問と回答選択肢を自由に設定したセッションを作成できます。
          </p>
          <p>
            <FontAwesomeIcon
              icon={faCaretRight}
              className="mr-2 text-gray-500"
            />
            学生は、アクセスコードを入力してセッションに参加できます。
          </p>
        </div>

        <div className="my-1 px-2 md:px-4">
          <div className="flex flex-col items-center justify-center gap-2 md:flex-row">
            <div className="w-full md:w-2/3">
              <Image
                src="/sp-student02.png"
                alt="Student Image"
                width={450}
                height={920}
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-center space-x-2.5 text-sm font-bold  text-indigo-800">
        <div className="rounded-md border-2 border-indigo-800 px-4 py-0.5 hover:bg-indigo-800 hover:text-white">
          <Link href="/signup" style="unstyled">
            ProgressLens を使ってみる（サインアップ）
          </Link>
        </div>
      </div>

      <h3>
        <div className="flex items-center text-xl font-bold text-indigo-800">
          <FontAwesomeIcon icon={faComments} className="mr-2" />
          ワークショップでの活用
        </div>
      </h3>
      <div className="mb-6 mt-3">
        <div className="mb-2 ml-1">
          参加者同士で状況を共有し、学び合いを促進します。ファシリテータは全体状況に応じた柔軟な進行とタイムマネジメントが可能になります。
        </div>
        <div className="ml-3 space-y-2 text-sm">
          <p>
            <FontAwesomeIcon
              icon={faThumbsUp}
              className="mr-2 text-indigo-700"
            />
            参加者間の進捗共有でメリハリのあるワークを実現
          </p>
          <p>
            <FontAwesomeIcon
              icon={faThumbsUp}
              className="mr-2 text-indigo-700"
            />
            状況の共有によるコミュニティの活性化
          </p>
          <p>
            <FontAwesomeIcon
              icon={faThumbsUp}
              className="mr-2 text-indigo-700"
            />
            ファシリテータは状況に合わせたサポートを提供
          </p>
        </div>
      </div>

      <h3>
        <div className="flex items-center text-xl font-bold text-indigo-800">
          <FontAwesomeIcon icon={faComments} className="mr-2" />
          ゲストログイン機能を完備
        </div>
      </h3>
      <div className="my-2 ml-1">
        45名分の<span className="font-bold">学生ゲストアカウント</span>
        を用意しています。
        <br />
        アカウント作成不要で ProgressLens
        の主機能が利用できます。単発の授業やデモにご利用ください。
      </div>
      <div className="my-1 px-2 md:px-4">
        <div className="flex flex-col items-center justify-center gap-2 md:flex-row">
          <div className="w-full md:w-2/3">
            <Image
              src="/sp-student03.png"
              alt="Student Image"
              width={400}
              height={920}
              priority
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
      <div className="my-3 ml-5 space-y-0.5 text-sm">
        <p>
          <FontAwesomeIcon icon={faCaretRight} className="mr-2 text-gray-500" />
          ゲストログインでは一部の機能がご利用になれません。
        </p>
      </div>

      <div className="mb-2 flex justify-center space-x-2.5 text-sm font-bold  text-indigo-800">
        <div className="rounded-md border-2 border-indigo-800  px-4 py-0.5 hover:bg-indigo-800 hover:text-white">
          <Link href="/login" style="unstyled">
            ゲストログインで ProgressLens を体験する
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
