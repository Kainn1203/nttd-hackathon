import { createClient } from "@/lib/supabase/server";
import { getUserTokenFromCookie } from "../../../_lib/getUserToken";
import { SupabaseClient } from '@supabase/supabase-js';

// 定数
const CONSTANTS = {
  ERROR_MESSAGES: {
    UNAUTHORIZED: "Unauthorized",
    INVALID_COMMUNITY_ID: "Invalid community ID",
    SLACK_CHANNEL_ID_REQUIRED: "slack_channel_id is required",
    COMMUNITY_NOT_FOUND: "Community not found",
    AUTHENTICATION_FAILED: "Authentication failed",
    FORBIDDEN: "Forbidden",
    DATABASE_UPDATE_FAILED: "Database update failed",
    INTERNAL_SERVER_ERROR: "Internal server error",
  },
  SUCCESS_MESSAGES: {
    SLACK_CHANNEL_UPDATED: "Slack channel ID updated successfully",
  },
} as const;

// 型定義
interface SlackChannelUpdateRequest {
  slack_channel_id: string;
}

interface CommunityData {
  id: number;
  owner_id: number; // 数値型に統一
}

interface UserData {
  user: {
    id: string;
  } | null;
}

interface ValidationResult {
  isValid: boolean;
  communityId?: number;
  error?: string;
  details?: string;
  status?: number;
}

interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  status?: number;
}

// エラーレスポンス作成ヘルパー
const createErrorResponse = (status: number, error: string, details: string) => {
  return new Response(JSON.stringify({ error, details }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
};

// 成功レスポンス作成ヘルパー
const createSuccessResponse = (data: Record<string, unknown>) => {
  return Response.json(data);
};

// バリデーション関数
const validateRequest = (id: string, body: SlackChannelUpdateRequest): ValidationResult => {
  const communityId = Number(id);
  
  if (!Number.isFinite(communityId)) {
    return {
      isValid: false,
      error: CONSTANTS.ERROR_MESSAGES.INVALID_COMMUNITY_ID,
      details: `Community ID must be a number, got: ${id}`,
      status: 400
    };
  }

  if (!body.slack_channel_id) {
    return {
      isValid: false,
      error: CONSTANTS.ERROR_MESSAGES.SLACK_CHANNEL_ID_REQUIRED,
      details: "Request body must contain slack_channel_id",
      status: 400
    };
  }

  return { isValid: true, communityId };
};

// コミュニティ取得関数
const getCommunity = async (supabase: SupabaseClient, communityId: number): Promise<OperationResult<CommunityData>> => {
  const { data: community, error: fetchError } = await supabase
    .from("community")
    .select("id, owner_id")
    .eq("id", communityId)
    .single();

  if (fetchError || !community) {
    console.error("Community fetch error:", fetchError);
    return {
      success: false,
      error: CONSTANTS.ERROR_MESSAGES.COMMUNITY_NOT_FOUND,
      details: fetchError?.message || "Community does not exist",
      status: 404
    };
  }

  return { success: true, data: community };
};

// ユーザー認証関数
const authenticateUser = async (supabase: SupabaseClient): Promise<OperationResult<UserData>> => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error("Session error:", sessionError);
    return {
      success: false,
      error: CONSTANTS.ERROR_MESSAGES.AUTHENTICATION_FAILED,
      details: sessionError.message,
      status: 401
    };
  }

  if (!session?.user) {
    return {
      success: false,
      error: CONSTANTS.ERROR_MESSAGES.FORBIDDEN,
      details: "No authenticated session found",
      status: 403
    };
  }

  return { success: true, data: { user: session.user } };
};

// 権限チェック関数（getMe()と同じ方法）
const checkOwnership = async (supabase: SupabaseClient, user: UserData, community: CommunityData): Promise<OperationResult> => {
  // userテーブルから数値IDを取得（getMe()と同じ方法）
  const { data: userRecord, error: userError } = await supabase
    .from("user")
    .select("id")
    .eq("auth_id", user.user!.id)
    .single();

  if (userError || !userRecord) {
    console.error("User record not found:", userError);
    return {
      success: false,
      error: CONSTANTS.ERROR_MESSAGES.FORBIDDEN,
      details: "User not found in database"
    };
  }

  console.log("User auth check:", {
    authId: user.user?.id,
    userId: userRecord.id,
    ownerId: community.owner_id,
    userIdType: typeof userRecord.id,
    ownerIdType: typeof community.owner_id,
    isEqual: userRecord.id === community.owner_id
  });

  // 数値ID同士で比較
  if (userRecord.id !== community.owner_id) {
    console.error("Permission denied:", {
      userId: userRecord.id,
      ownerId: community.owner_id,
      userIdType: typeof userRecord.id,
      ownerIdType: typeof community.owner_id
    });
    return {
      success: false,
      error: CONSTANTS.ERROR_MESSAGES.FORBIDDEN,
      details: "Only community owner can update Slack channel ID"
    };
  }

  return { success: true };
};

// データベース更新関数
const updateSlackChannelId = async (supabase: SupabaseClient, communityId: number, slackChannelId: string): Promise<OperationResult> => {
  const { error: updateError } = await supabase
    .from("community")
    .update({ slack_channel_id: slackChannelId })
    .eq("id", communityId);

  if (updateError) {
    console.error("Error updating slack_channel_id:", updateError);
    return {
      success: false,
      error: CONSTANTS.ERROR_MESSAGES.DATABASE_UPDATE_FAILED,
      details: updateError.message,
      status: 500
    };
  }

  return { success: true };
};

// メイン処理
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. トークン認証
    const token = getUserTokenFromCookie(req);
    if (!token) {
      return createErrorResponse(401, CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED, "Slack token not found");
    }

    // 2. リクエストパラメータの取得とバリデーション
    const { id } = await params;
    const body: SlackChannelUpdateRequest = await req.json();
    
    const validation = validateRequest(id, body);
    if (!validation.isValid || !validation.communityId) {
      return createErrorResponse(validation.status!, validation.error!, validation.details!);
    }

    const { communityId } = validation;
    console.log("Slack channel update request:", { communityId, slack_channel_id: body.slack_channel_id });

    // 3. Supabaseクライアントの初期化
    const supabase = await createClient();

    // 4. コミュニティの取得
    const communityResult = await getCommunity(supabase, communityId);
    if (!communityResult.success || !communityResult.data) {
      return createErrorResponse(communityResult.status!, communityResult.error!, communityResult.details!);
    }

    const community = communityResult.data;
    console.log("Community found:", { id: community.id, ownerId: community.owner_id });

    // 5. ユーザー認証
    const authResult = await authenticateUser(supabase);
    if (!authResult.success || !authResult.data) {
      return createErrorResponse(authResult.status!, authResult.error!, authResult.details!);
    }

    const user = authResult.data;

    // 6. 権限チェック（getMe()と同じ方法）
    const permissionResult = await checkOwnership(supabase, user, community);
    if (!permissionResult.success) {
      return createErrorResponse(permissionResult.status!, permissionResult.error!, permissionResult.details!);
    }

    console.log("User authorized:", { userId: user.user!.id });

    // 7. SlackチャンネルIDの更新
    const updateResult = await updateSlackChannelId(supabase, communityId, body.slack_channel_id);
    if (!updateResult.success) {
      return createErrorResponse(updateResult.status!, updateResult.error!, updateResult.details!);
    }

    console.log("Slack channel ID updated successfully");

    // 8. 成功レスポンス
    return createSuccessResponse({
      ok: true,
      message: CONSTANTS.SUCCESS_MESSAGES.SLACK_CHANNEL_UPDATED,
      communityId,
      slackChannelId: body.slack_channel_id
    });

  } catch (error) {
    console.error("Error in slack-channel update:", error);
    return createErrorResponse(
      500,
      CONSTANTS.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
