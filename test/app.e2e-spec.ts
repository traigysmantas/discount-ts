import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { AppService } from '../src/transaction/transaction.calculator';
import { readFile } from 'fs/promises';
import { join } from 'path';

describe('AppService', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('converts transactions correctly', async () => {
    const appService = app.get(AppService);

    const expectedOutput = await readFile(join(__dirname, './fixtures/output.txt'), 'utf-8');

    const result = await appService.init('../test/fixtures/input.txt');

    expect(result).toBe(expectedOutput);
  });
});
