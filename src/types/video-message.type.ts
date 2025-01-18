import { MessageSender } from '../enum/message-sender.enum';
import { MessageTarget } from '../enum/message-target.enum';
import { MessageType } from '../enum/message-type.enum';

export type VideoMessage = {
  type: MessageType;
  sender: MessageSender;
  target: MessageTarget;
  payload: object;
};
