import express, { Request, Response } from 'express';
import { Gateway } from './gateway';

const app = express();
const gateway = new Gateway();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello world');
});

app.get('/totals', async (req: Request, res: Response) => {
  res.send(gateway.getTotals());
});

app.get('/transaction/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  res.send({ tx: id, isCHZ: await gateway.isCHZTransaction(id) } );
});

export default app;
