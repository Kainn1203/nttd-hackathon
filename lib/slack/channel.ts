import { createActionClient } from "@/lib/supabase/action";

interface SlackChannelCreateParams {
  event: {
    id: number;
    name: string;
    owner_id: number;
    location?: string;
    deadline: string;
  };
  votes: {
    event_member_id: number;
    is_yes: boolean;
  }[];
  finalizedDate: string;
  members: { id: number; user_id: number }[];
}

export async function createParticipantSlackChannel({
  event,
  votes,
  finalizedDate,
  members,
}: SlackChannelCreateParams) {
  try {
    console.log("=== Creating Participant Slack Channel ===");
    console.log("Event:", event.name, "Finalized date:", finalizedDate);

    // 参加可能なユーザーのIDを取得
    const yesVotes = votes.filter((v) => v.is_yes === true);
    const yesMemberIds = yesVotes.map((v) => v.event_member_id);
    const participantIds = members
      .filter((m) => yesMemberIds.includes(m.id))
      .map((m) => m.user_id);

    console.log("Yes votes:", yesVotes.length, "Yes member IDs:", yesMemberIds);
    console.log("Participant IDs from votes:", participantIds);

    // 主催者も含める
    if (!participantIds.includes(event.owner_id)) {
      participantIds.push(event.owner_id);
    }

    console.log("Final participant IDs:", participantIds);

    // 参加者情報を取得
    const supabase = await createActionClient();
    const { data: participants, error: participantsError } = await supabase
      .from("user")
      .select("id, slack_user_id")
      .in("id", participantIds);

    if (participantsError) {
      console.error("Participants fetch error:", participantsError);
      // slack_user_idカラムが存在しない場合は空配列を返す
      if (participantsError.message.includes("slack_user_id does not exist")) {
        console.log(
          "slack_user_id column does not exist, skipping Slack channel creation"
        );
        return;
      }
      return;
    }

    // slack_user_idが設定されている参加者のみをフィルタ
    const slackParticipants =
      participants?.filter((p) => p.slack_user_id) || [];

    if (slackParticipants.length === 0) {
      console.log("Slack参加者が見つかりません");
      return;
    }

    console.log("Participants found:", participants.length);
    console.log(
      "Participants with Slack IDs:",
      participants.filter((p) => p.slack_user_id).length
    );

    // Slackチャンネル名を生成（イベント名ベース）
    const sanitizedEventName = event.name
      .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, "-")
      .toLowerCase()
      .substring(0, 20); // Slackチャンネル名は21文字以内
    const channelName = `イベント-${sanitizedEventName}`;
    const channelTopic = `🎉 ${event.name} - ${new Date(
      finalizedDate
    ).toLocaleDateString("ja-JP")}`;

    console.log("Creating Slack channel:", channelName);

    // Slackチャンネル作成
    const channelResponse = await fetch(
      "https://slack.com/api/conversations.create",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: channelName,
          topic: channelTopic,
          is_private: true,
        }),
      }
    );

    const channelData = await channelResponse.json();

    if (!channelData.ok) {
      console.error("Slack channel creation failed:", channelData.error);
      return;
    }

    console.log("Slack channel created successfully:", channelData.channel.id);

    const channelId = channelData.channel.id;

    // 参加者をチャンネルに招待
    for (const participant of slackParticipants) {
      if (participant.slack_user_id) {
        await fetch("https://slack.com/api/conversations.invite", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channel: channelId,
            users: participant.slack_user_id,
          }),
        });
      }
    }

    // 早期締切かどうかを判定
    const isEarlyFinalize = new Date(event.deadline) > new Date();

    // 確定通知メッセージを投稿
    const message = `🎉 *${event.name}* が確定しました！

📅 *確定日時*: ${new Date(finalizedDate).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })}

📍 *場所*: ${event.location || "未定"}

👥 *参加者*: ${participantIds.length}名

${
  isEarlyFinalize
    ? "⏰ *早期締切*: 主催者により回答締切日前に確定されました"
    : ""
}

皆さん、お疲れ様でした！楽しいイベントにしましょう 🎊`;

    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: channelId,
        text: message,
      }),
    });
  } catch (error) {
    console.error("Error creating participant Slack channel:", error);
  }
}
