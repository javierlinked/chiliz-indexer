import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionsService } from './transactions/transactions.service';
import { TransactionsController } from './transactions/transactions.controller';

@Module({
  imports: [],
  controllers: [AppController, TransactionsController],
  providers: [AppService, TransactionsService],
})
export class AppModule {}
