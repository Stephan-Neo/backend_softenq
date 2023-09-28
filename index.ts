import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const allowCrossDomain = (req: Request, res: Response, next: NextFunction) => {
  res.header(`Access-Control-Allow-Origin`, `*`);
  res.header(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
  res.header(`Access-Control-Allow-Headers`, `Content-Type`);
  next();
};

app.use(allowCrossDomain);
app.use(express.static(`public`));


app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get('/getUsers', (req, res) => {
    res.send({"text": "Hello World!"})
  })

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
