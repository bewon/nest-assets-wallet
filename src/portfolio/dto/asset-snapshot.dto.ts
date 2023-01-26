export class AssetSnapshotDto {
  id: string;
  name: string | null;
  group: string | null;
  capital?: number;
  value?: number;
  profit?: number;
  date?: Date;
}
