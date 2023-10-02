// Configs
import configVars from 'config/vars';
// @ts-ignore
import server, { sequelize } from 'config/server';

// Utils
import mstime from 'utils/MSTime';

mstime.start('app-start');

(async () => {
  await sequelize.sync({
    force: true,
  });

  server.listen(configVars.port, () => {
    // eslint-disable-next-line no-console
    console.info(`--- 🌟  Started (${configVars.env}) --- http://localhost:${configVars.port}`);
    // eslint-disable-next-line no-console
    console.log(`${mstime.end('app-start')?.last} ms`);
  });
})();
