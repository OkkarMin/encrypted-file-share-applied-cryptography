export interface IMessageObject {
  type: string;
  body: any;
  mimeType?: string;
  fileName?: string;
}

export interface IAsymmetricMessageObject {
  type: string;
  body: string;
  iv: any;
  signature: any;
  senderID: string;
  room: string;
  mimeType?: string;
  fileName?: string;
}
