import { BigNumber, constants, Contract, providers, utils } from 'ethers';
import abi from './chz.json';
import { stats } from './types';

export class Gateway {

  public static address = '0x3506424f91fd33084466f402d5d97f05f8e3b4af';

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

  protected handleEvents(): void {
    // The Contract object
    const contract = new Contract(Gateway.address, abi, this.provider);

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

  getTotals(): stats {
    const result = {
      startTime: this.startTime,
      currentTime: Date.now(),
      totalTransactions: this.transactionCounter,
      totalCHZTransactions: utils.formatUnits(this.accumulator, 'ether') + ' CHZ',
    };
    return result;
  }

  async isCHZTransaction(id: string): Promise<boolean> {
    let tx;
    try {
      tx = await this.provider.getTransaction(id);
    } catch (error) {
      return false;
    }
    return this.operationBelongsToCHZ(tx);
  }

  protected operationBelongsToCHZ(tx: providers.TransactionResponse): boolean {
    const cleanAddress = Gateway.address.toLowerCase().substring(2);
    return tx.to?.toLocaleLowerCase() === Gateway.address.toLocaleLowerCase() || 
        tx.from.toLocaleLowerCase() === Gateway.address.toLocaleLowerCase() || 
        tx.data.includes(cleanAddress);
  }
}

