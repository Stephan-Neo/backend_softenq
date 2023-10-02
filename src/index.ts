import cluster from 'cluster';
import os from 'os';

import logger from 'services/logger';

const numCPUs = os.cpus().length;

cluster.setupMaster({
  exec: `${__dirname}/worker.js`,
});

cluster.on('online', (worker) => {
  logger.log(`Worker ${worker.process.pid} is alive`);
});

cluster.on('exit', (worker) => {
  logger.log(`Worker ${worker.process.pid} died`);

  const restartedWorker = cluster
    .fork()
    .on('error', (error) => {
      logger.error(error.toString());
    })
    .once('online', () => {
      logger.log(`Worker ${restartedWorker.process.pid} is reconnected from ${worker.process.pid}`);
    });
});

for (let i = 0; i < numCPUs; i += 1) {
  cluster.fork().on('error', (error) => {
    logger.error(error.toString());
  });
}
