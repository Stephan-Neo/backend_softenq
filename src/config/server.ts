import http from 'http';

// Configs
import initExpress from 'config/express';
import initSequelize from 'config/sequelize';

export const sequelize = initSequelize();
export const express = initExpress(sequelize);

const server = http.createServer(express);

export default server;
