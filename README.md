# ProgressLens

![カバーイメージ](/public/progress-lens.jpg)

## 概要

🔗 https://progress-lens.vercel.app/

セルフペースド学習型の授業や、反応や発言が少ないクラスにおいて、サイレントマジョリティを含めた全体の「理解度」や「課題進捗」を可視化して効果的な授業を展開したいという課題を、匿名型・準リアルタイムの状況共有機能で解決するために開発したサービスです。

![アプリケーションイメージ](/.docs/images/app-image-01.png)

- (教員) 理解度の傾向や分布を把握して授業のペースと解説内容を最適化
- (教員) 演習課題の進捗状況に応じて最適なタイミングでヒントを提示
- (教員) サイレントマジョリティの声を授業にフィードバック
- (学生) 匿名型だから心理的負担なく学びの状況を共有可能
- (学生) クラス全体の状況を参考に自身の学習の量や速度を調整

### 活用シーン

- 学習者個人の理解度に合わせて「ペース」や「進度」を調整するセルフペースド学習 (自己調整学習) を主体とした授業や演習、アクティブラーニング形式の授業、オンライン型・オンデマンド型の授業
- 授業中の反応や発言が少ないクラス (ボーカルマイノリティに授業進行が影響されやすいクラス) の一斉進行型授業
- 技術研修やワークショップ (登録不要で利用可能な45人分の「ゲストアカウント」を用意しています)

## 使用技術

### フロントエンド

- **言語**: TypeScript
- **フレームワーク**: [Next.js 14](https://nextjs.org/) (App Router)
- **スタイリング**: [TailwindCSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **状態管理/データフェッチ**:
  - [SWR](https://swr.vercel.app/ja): データフェッチと状態管理
  - [Immer](https://immerjs.github.io/immer/): イミュータブルな状態管理

### バックエンド

- **言語**: TypeScript
- **フレームワーク**: [Next.js 14](https://nextjs.org/) (API Routes)
- **データベース**: PostgreSQL ([Supabase Database](https://supabase.com/docs/guides/database/overview))
- **ORM**: [Prisma](https://www.prisma.io/)
- **認証**: [Supabase Auth](https://supabase.com/docs/guides/auth)
- **ストレージ**: [Supabase Storage](https://supabase.com/docs/guides/storage)

### 開発環境・インフラ

- **IDE**: Visual Studio Code
- **ホスティング**: Vercel
- **バージョン管理**: Git, GitHub
- **CI/CD**: GitHub Actions
- **デザインカンプ**: Figma

### 主要なライブラリ

- zod: バリデーション
- react-hook-form: フォーム管理
- dnd-kit: ドラッグ&ドロップ実装
- ESLint / Prettier: コード品質管理
- Jest: テストフレームワーク

## データベース設計

- [ER図(詳細)@miro](https://miro.com/app/board/uXjVLu0vS_A=/?share_link_id=252351959507)

![ER図](/.docs/images/er-diagram.png)

## Acknowledgements

- [ShiftB](https://shiftb.dev/)