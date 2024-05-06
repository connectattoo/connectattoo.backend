export interface IConversation {
  id: string;
  createdAt: Date;
  lastMessage?: { content: string; createdAt: Date };
  profile?: { id: string; name: string; imageProfileUrl: string | null };
}
