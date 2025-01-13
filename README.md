# ProgressLens

## 概要

🔗 https://progress-lens.vercel.app/

内向的で意思表示や発言に消極的な学生が多い情報系学科において、サイレントマジョリティを含めたクラス全体の理解度や課題進捗を把握して効果的な授業したいという課題を、匿名型・準リアルタイムの状況共有機能で解決するために開発したサービスです。

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

### 主要なライブラリ

- zod: バリデーション
- react-hook-form: フォーム管理
- dnd-kit: ドラッグ&ドロップ実装
- ESLint / Prettier: コード品質管理
- Jest: テストフレームワーク

## データベース設計

- [ER図(詳細)@miro](https://miro.com/app/board/uXjVLu0vS_A=/?share_link_id=252351959507)

![ER図](/.docs/images/er-diagram.png)