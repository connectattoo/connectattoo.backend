import { Nullable } from '../../../shared/interface/nullable.type';

export interface IConversation {
  id: string;
  lastMessage?: { content: string; createdAt: Date };
  participants?: {
    id: string;
    name: string;
    imageProfileUrl: Nullable<string>;
  }[];
  blocked?: boolean;
}
