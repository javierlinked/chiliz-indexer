import { Injectable } from '@nestjs/common';
import { BigNumber, constants, Contract, providers, utils } from 'ethers';
import { stats } from 'src/types';

import * as abi from '../abi.json';

@Injectable()
export class TransactionsService {
  address = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  transactionCounter: number;
  startTime: number;
  accumulator: BigNumber;
  provider: providers.WebSocketProvider;

  constructor() {
    this.startTime = Date.now();
    this.accumulator = constants.Zero;
    this.transactionCounter = 0;
    this.provider = new providers.WebSocketProvider(
      `wss://mainnet.infura.io/ws/v3/${process.env.INFURA_KEY}`,
    );
    this.handleEvents();
  }

  /**
   * Handle 'Transfer' events from the blockchain
   * whilst application is running.
   */
  protected handleEvents(): void {
    // The Contract object
    const contract = new Contract(this.address, abi, this.provider);

    contract.on('Transfer', (from: string, to: string, value: BigNumber) => {
      this.transactionCounter++;
      // native method from BigNumber
      const sum = this.accumulator.add(value);

      console.log(
        `${from} -> ${to} ${utils.formatUnits(
          value,
          'ether',
        )} DAI, accum: ${utils.formatUnits(sum, 'ether')} DAI`,
      );
      this.accumulator = sum;
    });
  }

  /**
   * Get stats about DAI transactions.
   * @returns {stats}
   * @memberof Gateway
   **/
  getTotals(): stats {
    const result = {
      startTime: this.startTime,
      currentTime: Date.now(),
      totalTransactions: this.transactionCounter,
      totalDAITransactions:
        utils.formatUnits(this.accumulator, 'ether') + ' DAI',
    };
    return result;
  }

  /**
   * Check if a transaction is a DAI transaction.
   * @param {string} id - transaction id
   * @returns {Promise<boolean>}
   * @memberof Gateway
   **/
  async isDAITransaction(id: string): Promise<boolean> {
    let tx;
    try {
      tx = await this.provider.getTransactionReceipt(id);
    } catch (error) {
      return false;
    }
    return this.operationBelongsToDAI(tx);
  }

  /**
   * This should cover all DAI transactions, including those that are not part of the contract, e.g. Uniswap
   **/
  protected operationBelongsToDAI(tx?: providers.TransactionReceipt): boolean {
    if (!tx) {
      return false; // transaction not found or pending
    }
    const logs = tx.logs.map((log) => log.address.toLocaleLowerCase());
    return logs.includes(this.address.toLocaleLowerCase());
  }
}
