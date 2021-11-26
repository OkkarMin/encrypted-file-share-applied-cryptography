export interface IMessageObject {
  type: string;
  body: any;
  mimeType?: string;
  fileName?: string;
}

export interface IAsymmetricMessageObject {
  type: string;
  body: string;
  mimeType?: string;
  fileName?: string;
  myPublicKey: any;
  myPrivateKey: any;
}
