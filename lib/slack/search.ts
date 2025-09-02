interface SlackChannel {
  id: string;
  name: string;
  context_team_id: string;
}

interface SlackChannelSearchResult {
  channel_url: string;
  channel_id: string;
  channel_name: string;
}

interface SlackConversationsListResponse {
  ok: boolean;
  channels: SlackChannel[];
  error?: string;
}

export async function searchSlackChannelByEventName(
  eventName: string
): Promise<SlackChannelSearchResult | null> {
  try {
    // Slackチャンネル名を生成（イベント名ベース）
    const sanitizedEventName = eventName
      .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, "-")
      .toLowerCase()
      .substring(0, 20);
    const channelName = `イベント-${sanitizedEventName}`;

    console.log("Searching for Slack channel:", channelName);

    // Slack APIでチャンネルを検索（プライベートチャンネルも含む）
    const channelSearchResponse = await fetch(
      "https://slack.com/api/conversations.list?types=public_channel,private_channel",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const channelSearchData: SlackConversationsListResponse =
      await channelSearchResponse.json();

    if (!channelSearchData.ok) {
      console.error("Slack channel search failed:", channelSearchData.error);

      if (channelSearchData.error === "missing_scope") {
        throw new Error(
          "Slack AppのBot Token Scopesが不足しています。channels:read, groups:read, mpim:read, im:read を追加してください。"
        );
      }

      throw new Error("Slackチャンネルの検索に失敗しました");
    }

    // チャンネル名で検索
    const targetChannel = channelSearchData.channels.find(
      (channel: SlackChannel) => channel.name === channelName
    );

    if (!targetChannel) {
      console.log("Target channel not found:", channelName);
      return null;
    }

    // チャンネルURLを生成
    const channelUrl = `https://app.slack.com/client/${targetChannel.context_team_id}/${targetChannel.id}`;

    return {
      channel_url: channelUrl,
      channel_id: targetChannel.id,
      channel_name: targetChannel.name,
    };
  } catch (error) {
    console.error("Error searching Slack channel:", error);
    return null;
  }
}
