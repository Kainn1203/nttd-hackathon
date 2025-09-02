export type Event = {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  image_path: string | null;
  location: string | null;
  deadline: string;
  max_participants: number;
  is_finalized: boolean;
  finalized_date: string | null;
  channel_id: string | null;
  created_at: string;
};

export type CandidateDate = {
  id: number;
  event_id: number;
  candidate_date: string;
  created_at: string;
};

export type EventMember = {
  id: number;
  event_id: number;
  user_id: number;
  joind_at: string;
};

export type VoteDate = {
  id: number;
  event_member_id: number;
  candidate_id: number;
  is_yes: boolean;
  created_at: string;
};

export type EventWithCandidates = Event & {
  candidates: CandidateDate[];
  members: EventMember[];
  votes: VoteDate[];
  participants_count: number;
};

export type CandidateVoteStatus = {
  candidate_id: number;
  candidate_date: string;
  yes_count: number;
  no_count: number;
  total_count: number;
  is_recommended: boolean;
};
