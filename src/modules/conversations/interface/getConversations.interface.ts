export interface IGetConversations {
  id: string;
  createdAt: string;
  lastMessage: {
    id?: string;
    content?: string;
    createdAt?: string;
  };
  profile: {
    id: string;
    name: string;
    imageProfile: string;
  };
}
