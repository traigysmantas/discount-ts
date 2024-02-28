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

  private isValidPackageName(rawProviderName: PackageName | string): boolean {
    return Object.values(PackageName).includes(rawProviderName as PackageName);
  }

  isInputTransactionValid(input: string[]): boolean {
    if (input.length !== 3) {
      return false;
    }

    const [rawDate, rawSize, rawProviderName] = input;

    if (!this.isValidDate(rawDate) || !this.isValidSize(rawSize) || !this.isValidPackageName(rawProviderName)) {
      return false;
    }

    return true;
  }
}
