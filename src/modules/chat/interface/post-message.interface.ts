export interface IPostMessage {
  conversationId: string;
  listeners: { [x: string]: boolean }[];
}
