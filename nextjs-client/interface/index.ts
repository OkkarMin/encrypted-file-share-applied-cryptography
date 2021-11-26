export interface IMessageObject {
  type: string;
  body: any;
  mimeType?: string;
  fileName?: string;
  senderExportedPublicVerifyingKey?: any;
}

export interface IAsymmetricMessageObject {
  type: string;
  body: string;
  iv: any;
  signature: any;
  senderExportedPublicVerifyingKey: any;
  mimeType?: string;
  fileName?: string;
}
