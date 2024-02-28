import { Injectable } from '@nestjs/common';

import { PackageName } from './enums/package-name.enum';
import { PackageSize } from './enums/package-size.enum';

@Injectable()
export class TransactionValidator {
  constructor() {}

  private isValidDate(rawDate: string) {
    return !isNaN(Date.parse(rawDate));
  }

  private isValidSize(size: PackageSize | string) {
    return Object.values(PackageSize).includes(size as PackageSize);
  }

  private isValidProvider(name: PackageName | string): boolean {
    return Object.values(PackageName).includes(name as PackageName);
  }

  isInputTransactionValid(data: string[]): boolean {
    if (data.length !== 3) {
      return false;
    }

    const [rawDate, rawSize, rawProvider] = data;

    if (!this.isValidDate(rawDate) || !this.isValidSize(rawSize) || !this.isValidProvider(rawProvider)) {
      return false;
    }

    return true;
  }
}
