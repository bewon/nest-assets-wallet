import { AssetSnapshotInterface } from '../types';

export class AssetSnapshotDto implements AssetSnapshotInterface {
  id?: string;
  name?: string;
  group?: string;
  capital?: number;
  value?: number;
  profit?: number;
  date?: string;
}
