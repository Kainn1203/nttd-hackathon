import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMe } from "@/lib/supabase/me";

type CreateAnnouncementBody = {
  description: string;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const eventId = Number(id);

  if (!Number.isFinite(eventId)) {
    return NextResponse.json(
      { ok: false, error: "Invalid event ID" },
      { status: 400 }
    );
  }

  // ユーザー認証
  const me = await getMe();
  if (!me) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = (await req.json()) as CreateAnnouncementBody;

  if (!body?.description?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Description is required" },
      { status: 400 }
    );
  }

  try {
    // イベントの存在確認とオーナー権限チェック
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, owner_id")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { ok: false, error: "Event not found" },
        { status: 404 }
      );
    }

    if (event.owner_id !== me.id) {
      return NextResponse.json(
        { ok: false, error: "Only event owner can create announcements" },
        { status: 403 }
      );
    }

    // アナウンスを作成
    const { data: announcement, error: createError } = await supabase
      .from("event_announcements")
      .insert({
        event_id: eventId,
        description: body.description.trim(),
      })
      .select()
      .single();

    if (createError) {
      console.error("Announcement creation error:", createError);

      // テーブルが存在しない場合の特別な処理
      if (
        createError.code === "PGRST116" ||
        createError.message.includes("relation") ||
        createError.message.includes("does not exist")
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "event_announcementsテーブルが存在しません。データベースの設定を確認してください。",
            details: createError.message,
            code: createError.code,
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          ok: false,
          error: "Failed to create announcement",
          details: createError.message,
          code: createError.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: announcement });
  } catch (error) {
    console.error("Announcement creation error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const eventId = Number(id);

  if (!Number.isFinite(eventId)) {
    return NextResponse.json(
      { ok: false, error: "Invalid event ID" },
      { status: 400 }
    );
  }

  try {
    // イベントの存在確認
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { ok: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // アナウンス一覧を取得（作成日時の降順）
    const { data: announcements, error: fetchError } = await supabase
      .from("event_announcements")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Announcements fetch error:", fetchError);

      // テーブルが存在しない場合は空配列を返す
      if (
        fetchError.code === "PGRST116" ||
        fetchError.message.includes("relation") ||
        fetchError.message.includes("does not exist")
      ) {
        return NextResponse.json({ ok: true, data: [] });
      }

      return NextResponse.json(
        {
          ok: false,
          error: "Failed to fetch announcements",
          details: fetchError.message,
          code: fetchError.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: announcements || [] });
  } catch (error) {
    console.error("Announcements fetch error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
