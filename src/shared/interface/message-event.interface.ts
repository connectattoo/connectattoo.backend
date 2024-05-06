import { MessageEvent } from '@nestjs/common';

export class IMessageEvent<T extends object> implements MessageEvent {
  data: T;
}
