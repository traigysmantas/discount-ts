import { PackageName } from '../enums/package-name.enum';
import { PackageSize } from '../enums/package-size.enum';

export type InputTransaction = {
  day: Date;
  name: PackageName;
  packageSize: PackageSize;
};
