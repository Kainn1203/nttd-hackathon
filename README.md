## 初期セットアップ

node と npm が入っているかの確認

```bash
node -v
npm -v
```

バージョンが表示されれば OK1

プロジェクトをクローンしたら最初に以下のコマンドを実行

```bash
npm install
```

ローカル環境を立ち上げるときは以下のコマンドを実行

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を自分のブラウザで検索を掛ければ、ローカル環境で結果を閲覧可能

コードの編集後はホットリロードが働くので、基本的にはローカル環境を立ち上げ直す必要なし

## 開発ページ構成

- HOME ページ `app/page.tsx`
  - マイページ `app/myPage/page.tsx`
  - 内定者一覧ページ `app/members/page.tsx`
  - コミュニティ一覧ページ `app/communities/page.tsx`
    - 各コミュニティページ `app/communities/[id]/page.tsx`

## Git の管理方法

### Branch 管理

ブランチ構成は以下のように分ける（例）：

- main
  - dev
    - feature/my-page
    - feature/home
    - feature/members
    - feature/communities
    - feature/community-detail

各々が担当する機能をブランチで分けて開発する

push は dev に！（誰かと確認しながらやる）

dev から main には pr(pull request)を作成する

commit 命名規則は以下を参考に！（そんなに厳密にやらなくても、、、）
[https://qiita.com/itosho/items/9565c6ad2ffc24c09364]

## データベース

検討中（MySQL or Supabase）

## おすすめライブラリ等

### Material UI

既にデザインされたボタンや入力フォームなどのコンポーネントを使える
[https://mui.com/material-ui/]
