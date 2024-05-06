export interface IConversation {
  id: string;
  createdAt: Date;
  profile?: { id: string; name: string; imageProfileUrl: string | null };
}
