'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

import CommunityList from '@/components/communities/CommunityList';
import CreateCommunityModal from '@/components/communities/CreateCommunityModal';
import { uploadImage } from '@/lib/supabase/image'; // ← 追加

import type { Community } from '@/types/community';

// ★ インターフェースを拡張（画像対応）
interface NewCommunityForm {
  name: string;
  description: string;
  iconFile?: File | null;
  iconPreview?: string | null;
  coverFile?: File | null;
  coverPreview?: string | null;
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

export default function CommunitiesMain({ meId }: { meId: number }) {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // ★ 初期値に画像プロパティを追加
  const [newCommunity, setNewCommunity] = useState<NewCommunityForm>({ 
    name: '', 
    description: '',
    iconFile: null,
    iconPreview: null,
    coverFile: null,
    coverPreview: null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    fetchCommunities();
    if (meId != null) {
      fetchUserCommunities(meId);
    } else {
      if (loading) setLoading(false);
    }
  }, [meId]);

  // ★ 画像アップロード対応版のcreateeCommunity関数
  const createCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (meId == null || !newCommunity.name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      console.log("=== コミュニティ作成開始 ===");
      console.log("フォームデータ:", newCommunity);
      console.log("アイコンファイル:", newCommunity.iconFile);
      console.log("カバーファイル:", newCommunity.coverFile);

      const supabase = createClient();
      
      let iconUrl = null;
      let coverUrl = null;

      // アイコン画像のアップロード
      if (newCommunity.iconFile) {
        console.log("📤 アイコン画像アップロード開始...");
        iconUrl = await uploadImage(newCommunity.iconFile, {
          bucket: 'community-images', // 既存のバケットを使用
          folder: 'icons'
        });
        console.log("✅ アイコンアップロード結果:", iconUrl);
      }

      // カバー画像のアップロード
      if (newCommunity.coverFile) {
        console.log("📤 カバー画像アップロード開始...");
        coverUrl = await uploadImage(newCommunity.coverFile, {
          bucket: 'community-images', // 既存のバケットを使用
          folder: 'covers'
        });
        console.log("✅ カバーアップロード結果:", coverUrl);
      }

      // 1. コミュニティ作成（画像URL含む）
      const communityData = {
        name: newCommunity.name.trim(),
        description: newCommunity.description.trim(),
        owner_id: meId,
        image_path: iconUrl || coverUrl, // アイコンを優先、なければカバー画像
        // 分けて保存する場合は以下のように
        // icon_url: iconUrl,
        // cover_url: coverUrl,
      };

      console.log("💾 データベース保存データ:", communityData);

      const { data: community, error: communityError } = await supabase
        .from('community')
        .insert([communityData])
        .select()
        .single();
      
      if (communityError) {
        console.error("❌ コミュニティ作成エラー:", communityError);
        throw communityError;
      }

      console.log("🎉 コミュニティ作成成功:", community);

      // 2. 作成者を自動的にメンバーに追加
      const { error: memberError } = await supabase
        .from('community_members')
        .insert([
          {
            community_id: community.id,
            user_id: meId,
          },
        ]);
      
      if (memberError) {
        console.error("❌ メンバー追加エラー:", memberError);
        throw memberError;
      }

      // 3. データ再取得とフォームリセット
      await fetchCommunities();
      await fetchUserCommunities(meId);
      
      // ★ 画像プロパティも含めてリセット
      setNewCommunity({ 
        name: '', 
        description: '',
        iconFile: null,
        iconPreview: null,
        coverFile: null,
        coverPreview: null,
      });
      
      setShowCreateForm(false);
      
      console.log("🚀 コミュニティ作成完了");
      
    } catch (e) {
      console.error('❌ コミュニティ作成失敗:', e);
      alert('コミュニティの作成に失敗しました: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommunityClick = (communityId: number) => {
    router.push(`/communities/${communityId}`);
  };

  const closeCreateForm = () => {
    // ★ 画像プロパティも含めてリセット
    setNewCommunity({ 
      name: '', 
      description: '',
      iconFile: null,
      iconPreview: null,
      coverFile: null,
      coverPreview: null,
    });
    setShowCreateForm(false);
  };

  // 以下、既存のコードそのまま（UI部分）
  const safeCommunities = (communities ?? []).filter(
    (c): c is CommunityWithMembers => !!c && typeof c.id === 'number'
  );
  
  const myCommunities = safeCommunities.filter((c) => userCommunities.includes(c.id));
  const otherCommunities = safeCommunities.filter((c) => !userCommunities.includes(c.id));
  
  const stats = {
    totalCommunities: safeCommunities.length,
    myCommunities: myCommunities.length,
    otherCommunities: otherCommunities.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">読み込み中．．．</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">エラーが発生しました．</div>
          <div className="text-gray-600 mb-6">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">コミュニティ</h1>
              <p className="text-gray-600 mt-2">
                参加中: {stats.myCommunities}個 ／ 全体: {stats.totalCommunities}個
              </p>
            </div>

            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span className="text-xl">+</span>
              <span>新しいコミュニティを作成</span>
            </button>
          </div>
        </div>

        <CommunityList
          myCommunities={myCommunities}
          otherCommunities={otherCommunities}
          onCommunityClick={handleCommunityClick}
        />
        
        <CreateCommunityModal
          show={showCreateForm}
          newCommunity={newCommunity}
          onSubmit={createCommunity} // ← 修正版のcreateeCommunity
          onClose={closeCreateForm}
          onChange={setNewCommunity}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}