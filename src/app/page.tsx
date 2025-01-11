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
      <h1 className="mx-6 mb-1.5 text-4xl font-bold">ProgressLens</h1>

      <div className="mx-6 mb-8 text-sm font-bold italic text-slate-400">
        学びの状況（進捗や理解度など）を匿名性を保ちながら可視化して相互シェア
      </div>

      <h3>
        <div className="flex items-center text-xl font-bold text-indigo-800">
          <FontAwesomeIcon icon={faComments} className="mr-2" />
          授業での活用
        </div>
      </h3>
      <div className="mb-6 mt-2">
        <div className="mb-2 ml-2">
          授業の「理解度」や演習の「進み具合」を準リアルタイムに可視化して、全体的な傾向や分布を把握できます。
        </div>
        <div className="ml-3 space-y-0.5 text-sm">
          <p>
            <FontAwesomeIcon icon={faThumbsUp} className="mr-2" />
            演習の進捗に応じた最適なタイミングでヒントを提示
          </p>
          <p>
            <FontAwesomeIcon icon={faThumbsUp} className="mr-2" />
            状況を定量的に把握して的確な授業進行や解説が可能
          </p>
          <p>
            <FontAwesomeIcon icon={faThumbsUp} className="mr-2" />
            心理的な負担なく匿名で学びの状況を共有
          </p>
          <p>
            <FontAwesomeIcon icon={faThumbsUp} className="mr-2" />
            サイレントマジョリティの声を授業にフィードバック
          </p>
        </div>
        <div className="my-3 px-2 md:px-4">
          <div className="flex flex-col items-center justify-center gap-2 md:flex-row">
            <div className="w-full md:w-1/2">
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

        <div className="mb-2 ml-5 space-y-0.5 text-sm">
          <p>
            <FontAwesomeIcon icon={faCaretRight} className="mr-2" />
            教員は、任意の設問と回答選択肢を設定したセッションを作成できます。
          </p>
          <p>
            <FontAwesomeIcon icon={faCaretRight} className="mr-2" />
            学生は、7桁のアクセスコードを使ってセッションに参加できます。
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

      <h3>
        <div className="flex items-center text-xl font-bold text-indigo-800">
          <FontAwesomeIcon icon={faComments} className="mr-2" />
          ワークショップでの活用
        </div>
      </h3>
      <div className="mb-6 mt-2">
        <div className="mb-2 ml-2">
          参加者同士で状況を共有し、学び合いを促進します。ファシリテータは状況に応じた柔軟なプログラム進行が可能です。
        </div>
        <div className="ml-3 space-y-0.5 text-sm">
          <p>
            <FontAwesomeIcon icon={faThumbsUp} className="mr-2" />
            参加者間の進捗共有でメリハリのあるワークを実現
          </p>
          <p>
            <FontAwesomeIcon icon={faThumbsUp} className="mr-2" />
            状況の共有によるコミュニティの活性化
          </p>
          <p>
            <FontAwesomeIcon icon={faThumbsUp} className="mr-2" />
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
      <div className="my-2 ml-2">
        45名分の「学生用ゲストアカウント」を用意しています。
        <br />
        アカウント作成不要で ProgressLens
        の主機能が利用できます。単発の授業やデモンストレーションにご利用ください。
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
      <div className="ml-5 mt-3 space-y-0.5 text-sm">
        <p>
          <FontAwesomeIcon icon={faCaretRight} className="mr-2" />
          ゲストログインした場合は一部の機能がご利用になれません。
        </p>
      </div>
    </div>
  );
};

export default Home;
