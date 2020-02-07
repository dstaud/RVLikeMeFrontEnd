export interface ItokenPayload {
  _id: string;
  email: string;
  password: string;
  firstName?: string;
  tokenExpire: number;
}
