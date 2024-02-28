import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransactionCalculator } from './transaction/transaction.calculator';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error'] });
  const transactionCalculator = await app.get(TransactionCalculator);

  console.log(await transactionCalculator.init());

  await app.close();
}

bootstrap();
