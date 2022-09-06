import { Controller, Get, Param } from '@nestjs/common';
import { stats } from 'src/types';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  getStats(): stats {
    return this.transactionsService.getTotals();
  }

  @Get(':id')
  findOne(@Param() params): Promise<boolean> {
    return this.transactionsService.isCHZTransaction(params.id);
  }
}
