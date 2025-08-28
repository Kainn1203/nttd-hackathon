'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

import CommunityList from '@/components/communities/CommunityList';
import CreateCommunityModal from '@/components/communities/CreateCommunityModal';

import type { Community } from '@/types/community';

interface NewCommunityForm {
  name: string;
  description: string;
}
interface CommunityWithMembers extends Community {
  member_count?: number;
  is_member?: boolean;
}

// ------- Hooks -------
const useCommunities = () => {
  const [communities, setCommunities] = useState<CommunityWithMembers[]>([]);
  const [userCommunities, setUserCommunities] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchCommunities = async () => {
    setLoading(true); // 「読み込み中」にする
    try {
      setError(null); // エラーをリセット

      // データベースからコミュニティ情報を取得
      const { data, error } = await supabase
        .from('community') // 'community'というテーブルから
        .select(`*, community_members(count)`) // 全ての項目 + メンバー数
        .order('created_at', { ascending: false }); // 新しい順に並べる

      if (error) throw error; // エラーがあれば止まる

      // データを整理する
      const communitiesWithCount =
        data?.map((c: any) => ({
          ...c, // 元のデータをそのまま
          member_count: Array.isArray(c.community_members)
            ? c.community_members.length
            : (c.community_members?.count ?? 0), // メンバー数を追加
        })) ?? [];
      setCommunities(communitiesWithCount); // 状態を更新
    } catch (e) {
      console.error('コミュニティ取得エラー:', e);
      setError('コミュニティの取得に失敗しました');
    } finally {
    setLoading(false); // 必ず「読み込み完了」にする
    }
  };

  const fetchUserCommunities = async (userId: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', userId);
      if (error) throw error;
      setUserCommunities(data?.map((d) => d.community_id) ?? []);
    } catch (e) {
      console.error('ユーザーコミュニティ取得エラー:', e);
      setError('ユーザーのコミュニティ情報取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return {
    communities,
    userCommunities,
    loading,
    error,
    fetchCommunities,
    fetchUserCommunities,
    setCommunities,
    setUserCommunities,
    setLoading,
  };
};

// ------- Main Component -------
// ★ サーバーから受け取った meId を使う
export default function CommunitiesMain({ meId }: { meId: number }) {
  const router = useRouter(); // 画面遷移用
  const [showCreateForm, setShowCreateForm] = useState(false); // モーダル表示/非表示
  const [newCommunity, setNewCommunity] = useState<NewCommunityForm>({ name: '', description: '' }); // 新規作成フォームのデータ
  const [isSubmitting, setIsSubmitting] = useState(false); // 送信中かどうか

  // 上で作ったカスタムフックを使う
  const {
    communities,
    userCommunities,
    loading,
    error,
    fetchCommunities,
    fetchUserCommunities,
    setCommunities,
    setUserCommunities,
    setLoading,
  } = useCommunities();

  // 初回：一覧と自分の参加状況を取得
  useEffect(() => {
    fetchCommunities(); // 全コミュニティを取得
    if (meId != null) {
      fetchUserCommunities(meId); // 自分の参加コミュニティを取得
    } else {
      // 念のため（通常は meId は必ず来る）
      if (loading) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meId]); // meIdが変わった時だけ実行

  const createCommunity = async (e: React.FormEvent) => {
  e.preventDefault();
  if (meId == null || !newCommunity.name.trim() || isSubmitting) return;

  setIsSubmitting(true);
  try {
    const supabase = createClient();
    
    // 1. コミュニティ作成
    const { data: community, error: communityError } = await supabase
      .from('community')
      .insert([
        {
          name: newCommunity.name.trim(),
          description: newCommunity.description.trim(),
          owner_id: meId,
        },
      ])
      .select()
      .single();
    
    if (communityError) throw communityError;

    // 2. 作成者を自動的にメンバーに追加
    const { error: memberError } = await supabase
      .from('community_members')
      .insert([
        {
          community_id: community.id,
          user_id: meId,
        },
      ]);
    
    if (memberError) throw memberError;

    // 3. データ再取得とフォームリセット
    await fetchCommunities();
    await fetchUserCommunities(meId);
    setNewCommunity({ name: '', description: '' });
    setShowCreateForm(false);
    
  } catch (e) {
    console.error('コミュニティ作成エラー:', e);
    alert('コミュニティの作成に失敗しました');
  } finally {
    setIsSubmitting(false);
  }
};

  const handleCommunityClick = (communityId: number) => {
    router.push(`/communities/${communityId}`);
  };

  const closeCreateForm = () => {
    setNewCommunity({ name: '', description: '' });
    setShowCreateForm(false);
  };

// データを整理・分類
// ------- Derived -------
  const safeCommunities = (communities ?? []).filter(
    (c): c is CommunityWithMembers => !!c && typeof c.id === 'number'
  );
  // 参加中のコミュニティだけを抽出
  const myCommunities = safeCommunities.filter((c) => userCommunities.includes(c.id));
  // 参加していないコミュニティだけを抽出
  const otherCommunities = safeCommunities.filter((c) => !userCommunities.includes(c.id));
  // 統計情報
  const stats = {
    totalCommunities: safeCommunities.length, // 全体の数
    myCommunities: myCommunities.length, // 参加中の数
    otherCommunities: otherCommunities.length, // 参加可能の数
  };
  
  // 画面の状態管理
  // ------- UI States -------
  if (loading) { //ローディング画面
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">読み込み中．．．</div>
        </div>
      </div>
    );
  }

  if (error) { // エラー画面
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">エラーが発生しました．</div>
          <div className="text-gray-600 mb-6">{error}</div>
          <button
            onClick={() => window.location.reload()} //// ページをリロード
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  // 未ログインガードUIは不要（サーバーで redirect 済み）
  //  最終的な画面表示
  // ------- Render -------
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* ヘッダー部分 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">コミュニティ</h1>
              <p className="text-gray-600 mt-2">
                参加中: {stats.myCommunities}個 ／ 全体: {stats.totalCommunities}個
              </p>
            </div>

            {/* 新規作成ボタン */}
            <button
              onClick={() => setShowCreateForm(true)} // モーダルを表示
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span className="text-xl">+</span>
              <span>新しいコミュニティを作成</span>
            </button>
          </div>
        </div>

        {/* コミュニティリスト */}
        <CommunityList
          myCommunities={myCommunities} // 参加中のコミュニティ
          otherCommunities={otherCommunities} // 参加可能なコミュニティ
          onCommunityClick={handleCommunityClick} // クリック時の処理
        />
        <CreateCommunityModal
          show={showCreateForm}  // 表示するかどうか
          newCommunity={newCommunity}  // フォームのデータ
          onSubmit={createCommunity}  // 送信処理
          onClose={closeCreateForm}  // 閉じる処理
          onChange={setNewCommunity}  // 入力時の処理
          isSubmitting={isSubmitting}  // 送信中かどうか
        />
      </div>
    </div>
  );
}
