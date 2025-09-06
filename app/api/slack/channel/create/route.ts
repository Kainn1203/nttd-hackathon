import { getUserTokenFromCookie } from "../../../_lib/getUserToken";

export async function POST(req: Request) {
  try {
    const token = getUserTokenFromCookie(req);
    if (!token) return new Response("unauthorized", { status: 401 });

    const { name, description } = await req.json();
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(JSON.stringify({ 
        error: "チャンネル名は必須で、空文字列は許可されません",
        details: "有効なチャンネル名を入力してください"
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Slackチャンネル名の形式を整える
    let channelName = name.trim()
      .toLowerCase()
      .replace(/\s+/g, '-')           // スペースをハイフンに変換
      .replace(/[^a-z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\-_]/g, '') // 英数字、ひらがな、カタカナ、漢字、ハイフン、アンダースコア以外を除去
      .replace(/-+/g, '-')            // 連続するハイフンを単一のハイフンに
      .replace(/^-|-$/g, '');         // 先頭と末尾のハイフンを除去

    // チャンネル名の長さ制限（Slackの制限: 1-80文字）
    if (channelName.length === 0) {
      return new Response(JSON.stringify({ 
        error: "チャンネル名が無効です",
        details: "チャンネル名には有効な文字が含まれている必要があります"
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (channelName.length > 80) {
      channelName = channelName.substring(0, 80);
    }

    // チャンネル名が数字のみの場合、Slackでは許可されない
    if (/^\d+$/.test(channelName)) {
      channelName = `コミュニティ-${channelName}`;
    }

    // ひらがなのみの場合、Slackでは許可されないため、プレフィックスを追加
    if (/^[\u3040-\u309F]+$/.test(channelName)) {
      channelName = `コミュニティ-${channelName}`;
    }

    // カタカナのみの場合、Slackでは許可されないため、プレフィックスを追加
    if (/^[\u30A0-\u30FF]+$/.test(channelName)) {
      channelName = `コミュニティ-${channelName}`;
    }

    // 漢字のみの場合、Slackでは許可されないため、プレフィックスを追加
    if (/^[\u4E00-\u9FAF]+$/.test(channelName)) {
      channelName = `コミュニティ-${channelName}`;
    }

    console.log("📝 チャンネル名の処理:", { 
      original: name, 
      processed: channelName,
      originalLength: name.length,
      processedLength: channelName.length,
      hasHiragana: /[\u3040-\u309F]/.test(name),
      hasKatakana: /[\u30A0-\u30FF]/.test(name),
      hasKanji: /[\u4E00-\u9FAF]/.test(name),
      hasAlphanumeric: /[a-zA-Z0-9]/.test(name)
    });

    // チャンネル作成
    const createRes = await fetch("https://slack.com/api/conversations.create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: channelName,
        is_private: false, // パブリックチャンネル
        topic: description || `コミュニティ「${name}」のチャンネル`,
      }),
    });

    const createJson = await createRes.json();
    
    if (!createJson.ok) {
      console.error("Slack channel creation failed:", createJson);
      
      // 特定のエラーの場合の特別な処理
      if (createJson.error === "missing_scope") {
        const neededScopes = createJson.needed || "unknown";
        return new Response(JSON.stringify({ 
          error: "Slack権限が不足しています",
          details: `必要な権限: ${neededScopes}`,
          solution: "Slackアプリの再認証が必要です。一度ログアウトして再ログインしてください。"
        }), { 
          status: 403,
          headers: { "Content-Type": "application/json" }
        });
      }

      if (createJson.error === "invalid_name_required") {
        return new Response(JSON.stringify({ 
          error: "チャンネル名が無効です",
          details: "Slackのチャンネル名規則に従ってください",
          solution: "英数字、ひらがな、カタカナ、漢字、ハイフン、アンダースコアのみ使用可能です"
        }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      if (createJson.error === "name_taken") {
        return new Response(JSON.stringify({ 
          error: "チャンネル名が既に使用されています",
          details: "別のチャンネル名を試してください",
          solution: "チャンネル名を変更して再試行してください"
        }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      return new Response(JSON.stringify({ 
        error: createJson.error || "Failed to create Slack channel",
        details: createJson,
        originalName: name,
        processedName: channelName
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 作成者をチャンネルに招待
    const inviteRes = await fetch("https://slack.com/api/conversations.invite", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: createJson.channel.id,
        users: createJson.channel.creator, // 作成者を招待
      }),
    });

    const inviteJson = await inviteRes.json();
    
    if (!inviteJson.ok) {
      console.warn("Failed to invite creator to channel:", inviteJson);
    }

    return Response.json({
      ok: true,
      channel: {
        id: createJson.channel.id,
        name: createJson.channel.name,
        topic: createJson.channel.topic?.value || "",
        originalName: name,
        processedName: channelName
      },
    });

  } catch (error) {
    console.error("Error creating Slack channel:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
