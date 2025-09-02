export type Event = {
  id: number;
  name: string;
  location?: string;
  maxParticipants?: number;
  is_finalized: boolean;
  finalizedDate?: Date;
  channelId: string;
  created_at: string | null;
  deadline?: Date;
  description: string | null;
  owner_id: number | null;
};
