import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from "mongoose";
import cron from "node-cron"; 

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


import Connection from './database/db.js';
import Routes from './routes/route.js';
import RunCveScheduler from './controller/cve-scheduler-controller.js';
import RunCveFixScheduler  from './controller/cveFix-scheduler-controller.js';
import RunAssetCveMappingScheduler  from './controller/asset-cve-mapping-controller.js';
import {runlastModifiedScheduler,runlastPublishedScheduler}  from './controller/logs-controller.js';
import {runOemProductsScheduler}  from './controller/oem-products-controller.js';
import {RunCveMappingScheduler}  from './controller/vendor-product-cve-mapping-controller.js';
import {RunAssetProductCveMappingScheduler}  from './controller/asset-product-cve-mapping-controller.js';

dotenv.config();

const app = express();

cron.schedule(`58 23 * * *`, RunCveScheduler);
//cron.schedule(`58 23 * * *`, RunCveFixScheduler);
cron.schedule(`0 0 */2 * * *`, RunAssetCveMappingScheduler);

//cron.schedule(`01 0 * * *`, runOemProductsScheduler);

// cron.schedule(`01 02 * * *`, RunCveMappingScheduler);
cron.schedule(`0 0 */1 * * *`, RunAssetProductCveMappingScheduler);

//cron.schedule(`0 0 */2 * * *`, runlastModifiedScheduler);
//cron.schedule(`0 0 */2 * * *`, runlastPublishedScheduler);

//const PORT = 8000;
const PORT = process.env.PORT ? process.env.PORT : 8000;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

console.log(username)

Connection(username, password);

app.listen(PORT, () => console.log(`Server is running successfully on PORT ${PORT}`));


app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/', Routes);