import winston from 'winston';
import 'winston-mongodb';

const { combine, json, metadata, timestamp, printf } = winston.format;

const severityMap = {
    error: 3,    
    warn: 4,      
    info: 6,      
    debug: 7     
};

// Facility code, e.g., 16 for local0 (can be adjusted based on application)
const FACILITY = 16;

const syslogFormat = printf(({ level, message, timestamp, metadata }) => {
    const severity = severityMap[level] || 6; 
    const priority = `${FACILITY}${severity}`; 
   const version = 1;
    const appName = 'CVE';
    const processId = process.pid;
    const msgId = `ID${Math.floor(Math.random() * 100) + 1}`;
    metadata.priority = priority;
    metadata.version = version;
    metadata.appName = appName;
    metadata.processId = processId;
    metadata.msgId = msgId;
    return `<${priority}>${version} ${timestamp} ${appName} ${processId} ${msgId} - ${message}`;
});

const RunAssetProductCveMappingScheduler = printf(({ level, message, timestamp, metadata }) => {
    const severity = severityMap[level] || 6; 
    const priority = `${FACILITY}${severity}`; 
   const version = 1;
    const appName = 'Run Asset Product Cve Mapping Scheduler';
    const processId = process.pid;
    const msgId = `ID${Math.floor(Math.random() * 100) + 1}`;
    metadata.priority = priority;
    metadata.version = version;
    metadata.appName = appName;
    metadata.processId = processId;
    metadata.msgId = msgId;
    return `<${priority}>${version} ${timestamp} ${appName} ${processId} ${msgId} - ${message}`;
});

const runOemProductsScheduler = printf(({ level, message, timestamp, metadata }) => {
    const severity = severityMap[level] || 6; 
    const priority = `${FACILITY}${severity}`; 
   const version = 1;
    const appName = 'Run Oem Products Scheduler';
    const processId = process.pid;
    const msgId = `ID${Math.floor(Math.random() * 100) + 1}`;
    metadata.priority = priority;
    metadata.version = version;
    metadata.appName = appName;
    metadata.processId = processId;
    metadata.msgId = msgId;
    return `<${priority}>${version} ${timestamp} ${appName} ${processId} ${msgId} - ${message}`;
});

const runAssetCVEMappingScheduler = printf(({ level, message, timestamp, metadata }) => {
    const severity = severityMap[level] || 6; 
    const priority = `${FACILITY}${severity}`; 
   const version = 1;
    const appName = 'Run CVE Mapping Scheduler';
    const processId = process.pid;
    const msgId = `ID${Math.floor(Math.random() * 100) + 1}`;
    metadata.priority = priority;
    metadata.version = version;
    metadata.appName = appName;
    metadata.processId = processId;
    metadata.msgId = msgId;
    return `<${priority}>${version} ${timestamp} ${appName} ${processId} ${msgId} - ${message}`;
});

const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
        metadata(),
        syslogFormat,
        json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.MongoDB({
            db: 'mongodb+srv://premkumar:CfY4y95Jx6bbD7aO@cluster0.2tc04ol.mongodb.net/cve-tracker-uat',
            collection: 'nistlogs',
            options: { useUnifiedTopology: true, serverSelectionTimeoutMS: 60000, socketTimeoutMS: 60000 },
            meta: 'meta', // Specifies the metadata storage field in MongoDB
            storeHost: true,
        })
    ]
});

const systemLogger = winston.createLogger({
    level: 'error',
    format: combine(
        timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
        metadata(),
        syslogFormat,
        json()
    ),
    transports: [
        new winston.transports.MongoDB({
            db: 'mongodb+srv://premkumar:CfY4y95Jx6bbD7aO@cluster0.2tc04ol.mongodb.net/cve-tracker-uat',
            collection: 'systemlogs',
            options: { useUnifiedTopology: true, serverSelectionTimeoutMS: 60000, socketTimeoutMS: 60000 },
            meta: 'meta', // Specifies the metadata storage field in MongoDB
            storeHost: true,
        })
    ]
});

const userActivityLogger = winston.createLogger({
    level: 'error',
    format: combine(
        timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
        metadata(),
        syslogFormat,
        json()
    ),
    transports: [
        new winston.transports.MongoDB({
            db: 'mongodb+srv://premkumar:CfY4y95Jx6bbD7aO@cluster0.2tc04ol.mongodb.net/cve-tracker-uat',
            collection: 'userActivitylogs',
            options: { useUnifiedTopology: true, serverSelectionTimeoutMS: 60000, socketTimeoutMS: 60000 },
            meta: 'meta', // Specifies the metadata storage field in MongoDB
            storeHost: true,
        })
    ]
});

const runAssetProductCveMappingSchedulerLogger = winston.createLogger({
    level: 'error',
    format: combine(
        timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
        metadata(),
        RunAssetProductCveMappingScheduler,
        json()
    ),
    transports: [
        new winston.transports.MongoDB({
            db: 'mongodb+srv://premkumar:CfY4y95Jx6bbD7aO@cluster0.2tc04ol.mongodb.net/cve-tracker-uat',
            collection: 'schedulerlogs',
            options: { useUnifiedTopology: true, serverSelectionTimeoutMS: 60000, socketTimeoutMS: 60000 },
            meta: 'meta', // Specifies the metadata storage field in MongoDB
            storeHost: true,
        })
    ]
});

const runOemProductsSchedulerLogger = winston.createLogger({
    level: 'error',
    format: combine(
        timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
        metadata(),
        runOemProductsScheduler,
        json()
    ),
    transports: [
        new winston.transports.MongoDB({
            db: 'mongodb+srv://premkumar:CfY4y95Jx6bbD7aO@cluster0.2tc04ol.mongodb.net/cve-tracker-uat',
            collection: 'schedulerlogs',
            options: { useUnifiedTopology: true, serverSelectionTimeoutMS: 60000, socketTimeoutMS: 60000 },
            meta: 'meta', // Specifies the metadata storage field in MongoDB
            storeHost: true,
        })
    ]
});

const runAssetCVEMappingSchedulerLogger = winston.createLogger({
    level: 'error',
    format: combine(
        timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
        metadata(),
        runAssetCVEMappingScheduler,
        json()
    ),
    transports: [
        new winston.transports.MongoDB({
            db: 'mongodb+srv://premkumar:CfY4y95Jx6bbD7aO@cluster0.2tc04ol.mongodb.net/cve-tracker-uat',
            collection: 'schedulerlogs',
            options: { useUnifiedTopology: true, serverSelectionTimeoutMS: 60000, socketTimeoutMS: 60000 },
            meta: 'meta', // Specifies the metadata storage field in MongoDB
            storeHost: true,
        })
    ]
});

export default logger;
export { systemLogger, userActivityLogger,runAssetProductCveMappingSchedulerLogger,runOemProductsSchedulerLogger,runAssetCVEMappingSchedulerLogger};