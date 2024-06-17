import { Role } from './role';

export class Account {
  id?: string;
  title?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: Role;
  jwtToken?: string;
  tokens?: any;
}
