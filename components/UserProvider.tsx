// components/UserProvider.tsx
"use client";
import { createContext, useContext } from "react";
import { Me } from "../types/me";

// ① Contextの作成：デフォルトは null（未ログイン）
const MeContext = createContext<Me>(null);

// ② Provider：Serverから渡された "value" を保持して配る
export function UserProvider({
  value,
  children,
}: {
  value: Me;
  children: React.ReactNode;
}) {
  return <MeContext.Provider value={value}>{children}</MeContext.Provider>;
}

// ③ フック：どこからでも現在のユーザーを取得
export function useMe() {
  return useContext(MeContext);
}
