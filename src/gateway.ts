import { BigNumber, constants, Contract, providers, utils } from 'ethers';
import { stats } from '.';
import abi from './chz.json';
export class Gateway {

  address = '0x3506424f91fd33084466f402d5d97f05f8e3b4af';
  transactionCounter: number;;
  startTime: number;
  accumulator: BigNumber; 
  provider: providers.WebSocketProvider;

  constructor() {
    this.startTime = Date.now();
    this.accumulator = constants.Zero;
    this.transactionCounter = 0;
    this.provider = new providers.WebSocketProvider(
      `wss://mainnet.infura.io/ws/v3/${process.env.INFURA_KEY}`
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
        `${from} -> ${to} ${utils.formatUnits(value, 'ether')} CHZ, accum: ${utils.formatUnits(sum, 'ether')} CHZ`
      );
      this.accumulator = sum;
    });
  }

  /**
   * Get stats about CHZ transactions.
   * @returns {stats}
   * @memberof Gateway
   **/
  getTotals(): stats {
    const result = {
      startTime: this.startTime,
      currentTime: Date.now(),
      totalTransactions: this.transactionCounter,
      totalCHZTransactions: utils.formatUnits(this.accumulator, 'ether') + ' CHZ',
    };
    return result;
  }

  /**
   * Check if a transaction is a CHZ transaction.
   * @param {string} id - transaction id
   * @returns {Promise<boolean>}
   * @memberof Gateway
   **/ 
  async isCHZTransaction(id: string): Promise<boolean> {
    let tx;
    try {
      tx = await this.provider.getTransactionReceipt(id);
    } catch (error) {
      return false;
    }
    return this.operationBelongsToCHZ(tx);
  }

  /**
   * This should cover all CHZ transactions, including those that are not part of the contract, e.g. Uniswap
   **/
  protected operationBelongsToCHZ(tx: providers.TransactionReceipt): boolean {
    const logs = tx.logs.map(log => log.address.toLocaleLowerCase());
    return logs.includes(this.address.toLocaleLowerCase());
  }
}

