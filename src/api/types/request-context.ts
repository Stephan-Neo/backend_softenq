import { User } from 'models/user.model';
import { Device } from 'models/device.model';

export interface RequestContext {
  user: User | null;
  device: Device | null;
  isAdmin: boolean;
}
