import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { TransactionCalculator } from '../src/transaction/transaction.calculator';
import { readFile } from 'fs/promises';
import { join } from 'path';

describe(`${TransactionCalculator.name}`, () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('converts transactions correctly', async () => {
    const transactionCalculator = app.get(TransactionCalculator);

    const expectedOutput = await readFile(join(__dirname, './fixtures/output.txt'), 'utf-8');

    const result = await transactionCalculator.init('../../test/fixtures/input.txt');

    expect(result).toBe(expectedOutput);
  });
});
