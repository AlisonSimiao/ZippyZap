/**
 * Webhook Job Types
 *
 * This file defines all the types for webhook job data that can be processed
 * by the webhook queue system.
 */

// Base interface for all webhook jobs
export interface IWebhookJob {
  idUser: string;
  type: WebhookEventType;
  data: Record<string, any>;
}

export interface IWuzapiMessageEvent {
  Info: Info;
  IsBotInvoke: boolean;
  IsDocumentWithCaption: boolean;
  IsEdit: boolean;
  IsEphemeral: boolean;
  IsLottieSticker: boolean;
  IsViewOnce: boolean;
  IsViewOnceV2: boolean;
  IsViewOnceV2Extension: boolean;
  Message: Message;
  NewsletterMeta: any;
  RawMessage: RawMessage;
  RetryCount: number;
  SourceWebMsg: any;
  UnavailableRequestID: string;
}

export interface IWuzaoiReceiptEvent {
  AddressingMode: string;
  BroadcastListOwner: string;
  BroadcastRecipients: null;
  Chat: '120363422805374757@g.us';
  IsFromMe: boolean;
  IsGroup: boolean;
  MessageIDs: ['2A62BE9D201B4729B22C'];
  MessageSender: '165528660406524@lid';
  RecipientAlt: string;
  Sender: '69857760522328@lid';
  SenderAlt: string;
  Timestamp: string;
  Type: 'read';
}

export interface Info {
  AddressingMode: string;
  BroadcastListOwner: string;
  BroadcastRecipients: any;
  Category: string;
  Chat: string;
  DeviceSentMeta: any;
  Edit: string;
  ID: string;
  IsFromMe: boolean;
  IsGroup: boolean;
  MediaType: string;
  MsgBotInfo: MsgBotInfo;
  MsgMetaInfo: MsgMetaInfo;
  Multicast: boolean;
  PushName: string;
  RecipientAlt: string;
  Sender: string;
  SenderAlt: string;
  ServerID: number;
  Timestamp: string;
  Type: string;
  VerifiedName: VerifiedName;
}

export interface MsgBotInfo {
  EditSenderTimestampMS: string;
  EditTargetID: string;
  EditType: string;
}

export interface MsgMetaInfo {
  DeprecatedLIDSession: any;
  TargetChat: string;
  TargetID: string;
  TargetSender: string;
  ThreadMessageID: string;
  ThreadMessageSenderJID: string;
}

export interface VerifiedName {
  Certificate: Certificate;
  Details: Details;
}

export interface Certificate {
  details: string;
  signature: string;
}

export interface Details {
  issuer: string;
  serial: number;
  verifiedName: string;
}

export interface Message {
  conversation: string;
  extendedTextMessage: {
    text: string;
  };
  imageMessage: ImageMessage;
  messageContextInfo: MessageContextInfo;
  reactionMessage: ReactionMessage;
  ptvMessage: IPTVMessage;
  senderKeyDistributionMessage: any;
}

export interface IPTVMessage {
  JPEGThumbnail: string;
  URL: string;
  directPath: string;
  externalShareFullVideoDurationInSeconds: number;
  fileEncSHA256: string;
  fileLength: number;
  fileSHA256: string;
  height: number;
  mediaKey: string;
  mediaKeyTimestamp: number;
  mimetype: string;
  seconds: number;
  streamingSidecar: string;
  width: number;
}
export interface ReactionMessage {
  key: {
    ID: string;
    fromMe: boolean;
    participant: string;
    remoteJID: string;
  };
  senderTimestampMS: number;
  text: '❤️';
}

export interface ImageMessage {
  JPEGThumbnail: string;
  URL: string;
  caption: string;
  contextInfo: ContextInfo;
  directPath: string;
  fileEncSHA256: string;
  fileLength: number;
  fileSHA256: string;
  height: number;
  mediaKey: string;
  mimetype: string;
  viewOnce: boolean;
  width: number;
}

export interface ContextInfo {
  disappearingMode: DisappearingMode;
}

export interface DisappearingMode {
  initiator: number;
}

export interface MessageContextInfo {
  messageSecret: string;
  quotedMessage: {
    conversation: string;
    extendedTextMessage: {
      text: string;
    };
  };
}

export interface RawMessage {
  imageMessage: ImageMessage2;
  messageContextInfo: MessageContextInfo2;
}

export interface ImageMessage2 {
  JPEGThumbnail: string;
  URL: string;
  caption: string;
  contextInfo: ContextInfo2;
  directPath: string;
  fileEncSHA256: string;
  fileLength: number;
  fileSHA256: string;
  height: number;
  mediaKey: string;
  mimetype: string;
  viewOnce: boolean;
  width: number;
}

export interface ContextInfo2 {
  disappearingMode: DisappearingMode2;
}

export interface DisappearingMode2 {
  initiator: number;
}

export interface MessageContextInfo2 {
  messageSecret: string;
}

// Union type of all possible webhook event types
export type WebhookEventType =
  | 'QR'
  | 'session'
  | 'message.received'
  | 'message.sent'
  | 'message.delivered'
  | 'message.read'
  | 'message.failed'
  | 'session.connected'
  | 'session.disconnected'
  | 'read_receipt'
  | 'receipt'
  | 'presence'
  | 'chat_presence'
  | 'history_sync'
  | 'group'
  | 'undecryptable_message'
  | 'media_retry';

// Specific job data types for each event

export interface QRJobData {
  qr: string;
  expireAt: number;
}

export interface SessionJobData {
  status: 'connected' | 'disconnected' | 'connecting' | 'qr';
  timestamp?: number;
  [key: string]: any;
}

export interface MessageReceivedJobData {
  messageId: string;
  from: string;
  to: string;
  body?: string;
  type:
    | 'text'
    | 'image'
    | 'video'
    | 'audio'
    | 'document'
    | 'sticker'
    | 'location'
    | 'contact';
  timestamp: number;
  [key: string]: any;
}

export interface MessageSentJobData {
  messageId: string;
  to: string;
  timestamp: number;
  [key: string]: any;
}

export interface MessageDeliveredJobData {
  messageId: string;
  timestamp: number;
  [key: string]: any;
}

export interface MessageReadJobData {
  messageId: string;
  timestamp: number;
  [key: string]: any;
}

export interface MessageFailedJobData {
  messageId: string;
  error: string;
  timestamp: number;
  [key: string]: any;
}

export interface SessionConnectedJobData {
  timestamp: number;
  [key: string]: any;
}

export interface SessionDisconnectedJobData {
  reason?: string;
  timestamp: number;
  [key: string]: any;
}

export interface ReadReceiptJobData {
  messageId: string;
  from: string;
  timestamp: number;
  [key: string]: any;
}

export interface ReceiptJobData {
  messageId: string;
  type: 'sent' | 'delivered' | 'read';
  timestamp: number;
  [key: string]: any;
}

export interface PresenceJobData {
  from: string;
  status: 'available' | 'unavailable' | 'composing' | 'recording';
  timestamp: number;
  [key: string]: any;
}

export interface ChatPresenceJobData {
  chatId: string;
  status: 'composing' | 'recording' | 'paused';
  timestamp: number;
  [key: string]: any;
}

export interface HistorySyncJobData {
  progress: number;
  timestamp: number;
  [key: string]: any;
}

export interface GroupJobData {
  groupId: string;
  action:
    | 'create'
    | 'update'
    | 'delete'
    | 'add_participant'
    | 'remove_participant';
  timestamp: number;
  [key: string]: any;
}

export interface UndecryptableMessageJobData {
  messageId: string;
  from: string;
  timestamp: number;
  [key: string]: any;
}

export interface MediaRetryJobData {
  messageId: string;
  attempt: number;
  timestamp: number;
  [key: string]: any;
}

// Typed webhook job interfaces for each event type
export interface QRWebhookJob extends Omit<IWebhookJob, 'type' | 'data'> {
  type: 'QR';
  data: QRJobData;
}

export interface SessionWebhookJob extends Omit<IWebhookJob, 'type' | 'data'> {
  type: 'session';
  data: SessionJobData;
}

export interface MessageReceivedWebhookJob
  extends Omit<IWebhookJob, 'type' | 'data'> {
  type: 'message.received';
  data: MessageReceivedJobData;
}

export interface MessageSentWebhookJob
  extends Omit<IWebhookJob, 'type' | 'data'> {
  type: 'message.sent';
  data: MessageSentJobData;
}

export interface MessageDeliveredWebhookJob
  extends Omit<IWebhookJob, 'type' | 'data'> {
  type: 'message.delivered';
  data: MessageDeliveredJobData;
}

export interface MessageReadWebhookJob
  extends Omit<IWebhookJob, 'type' | 'data'> {
  type: 'message.read';
  data: MessageReadJobData;
}

export interface MessageFailedWebhookJob
  extends Omit<IWebhookJob, 'type' | 'data'> {
  type: 'message.failed';
  data: MessageFailedJobData;
}

export interface SessionConnectedWebhookJob
  extends Omit<IWebhookJob, 'type' | 'data'> {
  type: 'session.connected';
  data: SessionConnectedJobData;
}

export interface SessionDisconnectedWebhookJob
  extends Omit<IWebhookJob, 'type' | 'data'> {
  type: 'session.disconnected';
  data: SessionDisconnectedJobData;
}

export interface ReadReceiptWebhookJob
  extends Omit<IWebhookJob, 'type' | 'data'> {
  type: 'read_receipt';
  data: ReadReceiptJobData;
}

export interface ReceiptWebhookJob extends Omit<IWebhookJob, 'type' | 'data'> {
  type: 'receipt';
  data: ReceiptJobData;
}

export interface PresenceWebhookJob extends Omit<IWebhookJob, 'type' | 'data'> {
  type: 'presence';
  data: PresenceJobData;
}

export interface ChatPresenceWebhookJob
  extends Omit<IWebhookJob, 'type' | 'data'> {
  type: 'chat_presence';
  data: ChatPresenceJobData;
}

export interface HistorySyncWebhookJob
  extends Omit<IWebhookJob, 'type' | 'data'> {
  type: 'history_sync';
  data: HistorySyncJobData;
}

export interface GroupWebhookJob extends Omit<IWebhookJob, 'type' | 'data'> {
  type: 'group';
  data: GroupJobData;
}

export interface UndecryptableMessageWebhookJob
  extends Omit<IWebhookJob, 'type' | 'data'> {
  type: 'undecryptable_message';
  data: UndecryptableMessageJobData;
}

export interface MediaRetryWebhookJob
  extends Omit<IWebhookJob, 'type' | 'data'> {
  type: 'media_retry';
  data: MediaRetryJobData;
}

// Union type of all specific webhook jobs
export type TypedWebhookJob =
  | QRWebhookJob
  | SessionWebhookJob
  | MessageReceivedWebhookJob
  | MessageSentWebhookJob
  | MessageDeliveredWebhookJob
  | MessageReadWebhookJob
  | MessageFailedWebhookJob
  | SessionConnectedWebhookJob
  | SessionDisconnectedWebhookJob
  | ReadReceiptWebhookJob
  | ReceiptWebhookJob
  | PresenceWebhookJob
  | ChatPresenceWebhookJob
  | HistorySyncWebhookJob
  | GroupWebhookJob
  | UndecryptableMessageWebhookJob
  | MediaRetryWebhookJob;
