// import { AppAbility } from './ability.factory';

export {};

declare global {
  namespace Express {
    // interface Request {
    //   ability?: AppAbility;
    // }
    interface User {
      id?: string;
      email?: string;
    }
  }
}
