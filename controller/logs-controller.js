import LogCve from '../model/logsSchema.js';
import escapeStringRegexp from 'escape-string-regexp';
import axios from "axios";
import mongoose from 'mongoose';


// Define a Mongoose schema (optional if you need to process the data further)
const LogSchema = new mongoose.Schema({}, { strict: false });
const NistLog = mongoose.model('NistLog', LogSchema, 'nistlogs');
const SystemLog = mongoose.model('SystemLog', LogSchema, 'systemlogs');
const UserActivityLog = mongoose.model('UserActivityLog', LogSchema, 'userActivitylogs');
const SchedulerLog = mongoose.model('SchedulerLog', LogSchema, 'schedulerlogs');


export const runlastModifiedScheduler = async (request, response) => {

    try {
      
        var dateTime = new Date();
        var month = dateTime.getMonth() + 1;
        let date = ("0" + dateTime.getDate()).slice(-2);
        var year = dateTime.getFullYear();
        var hourago = new Date(dateTime.getTime() - (1000*120*60));
        var currentTime = new Date(dateTime.getTime());
        var backHour = hourago.getHours();
        var backMinute = hourago.getMinutes();
        var currentHour = currentTime.getHours();
        var currentMinute = currentTime.getMinutes();

        var lastModStartDate  =year+"-"+month+"-"+date+"T"+backHour+":"+backMinute+":00.000%2B01:00";
        var lastModEndDate  =year+"-"+month+"-"+date+"T"+currentHour+":"+currentMinute+":00.000%2B01:00";

        var ppubSttartDate =year+"-"+month+"-"+date+"T"+backHour+":"+backMinute+":00.000";
        var pubEndDate =year+"-"+month+"-"+date+"T"+currentHour+":"+currentMinute+":00.000";

        const lastModifiedUrl = 'https://services.nvd.nist.gov/rest/json/cves/2.0/?lastModStartDate='+lastModStartDate+"&lastModEndDate="+lastModEndDate;

       
       // const pubUrl = 'https://services.nvd.nist.gov/rest/json/cves/2.0/?pubStartDate='+ppubSttartDate+'&pubEndDate='+pubEndDate;
        
        axios.get(
            lastModifiedUrl,
            { headers: { 'apikey': '2d3a2cf2-1934-4620-bce2-f69b9e5dfb43' } })
        
        
            .then(response => {
        
              let cveDetails = response.data;
               
              cveDetails.vulnerabilities.forEach((cveData) => {

            
                const metrcis = cveData.cve.metrics;
                let severity = "";
        
                let cveDataCopy = { ...cveData.cveDetails };
        
                if (Object.keys(metrcis).length > 0) {
        
        
                  const filteredMetrics = [];
                  Object.keys(metrcis).forEach((key) => {
                    const sortedMetrics = metrcis[key].sort((a, b) => (a.cvssData.baseScore < b.cvssData.baseScore) ? 1 : a.cvssData.baseScore > b.cvssData.baseScore ? -1 : 0);
                    filteredMetrics.push(sortedMetrics[0])
                  })
        
                  const priorityMetric = filteredMetrics.sort((a, b) => (a.cvssData.baseScore < b.cvssData.baseScore) ? 1 : a.cvssData.baseScore > b.cvssData.baseScore ? -1 : 0)[0];
        
                  cveDataCopy = {
                    ...cveDataCopy,
                    metrics: {
                      [Object.keys(metrcis)[0]]: [{ ...priorityMetric }]
                    }
                  }
                  severity = priorityMetric.cvssData.baseSeverity ?? priorityMetric.baseSeverity
                  let saveCveData = {
                    date: cveData.cve.lastModified, cveId: cveData.cve.id, cveDetails: cveData,
                    seviarity: severity, month: month, year: year, fix: 'N',"type":"Modified"
                  };
                  LogCve.create(saveCveData);
                } else {
                  let saveCveData = {
                    date: cveData.cve.lastModified, cveId: cveData.cve.id, cveDetails: cveData,
                    seviarity: severity, month: month, year: year, fix: 'N',"type":"Modified"
                  };
                 
                  LogCve.create(saveCveData);
                }
        
              });
        
            }).catch(error => console.log(error))


    } catch (error) {

    }
};



export const runlastPublishedScheduler = async (request, response) => {

    try {
   
        var dateTime = new Date();
        var month = dateTime.getMonth() + 1;
        let date = ("0" + dateTime.getDate()).slice(-2);
        var year = dateTime.getFullYear();
        var hourago = new Date(dateTime.getTime() - (1000*120*60));
        var currentTime = new Date(dateTime.getTime());
        var backHour = hourago.getHours();
        var backMinute = hourago.getMinutes();
        var currentHour = currentTime.getHours();
        var currentMinute = currentTime.getMinutes();

        

        var ppubSttartDate =year+"-"+month+"-"+date+"T"+backHour+":"+backMinute+":00.000";
        var pubEndDate =year+"-"+month+"-"+date+"T"+currentHour+":"+currentMinute+":00.000";

       // const lastModifiedUrl = 'https://services.nvd.nist.gov/rest/json/cves/2.0/?lastModStartDate='+lastModStartDate+"&lastModEndDate="+lastModEndDate;

       const pubUrl = 'https://services.nvd.nist.gov/rest/json/cves/2.0/?pubStartDate='+ppubSttartDate+'&pubEndDate='+pubEndDate;        
        axios.get(
            pubUrl,
            { headers: { 'apikey': '2d3a2cf2-1934-4620-bce2-f69b9e5dfb43' } })
        
        
            .then(response => {
        
              let cveDetails = response.data;
                    
              cveDetails.vulnerabilities.forEach((cveData) => {
                const metrcis = cveData.cve.metrics;
                let severity = "";
        
                let cveDataCopy = { ...cveData.cveDetails };
        
                if (Object.keys(metrcis).length > 0) {
        
        
                  const filteredMetrics = [];
                  Object.keys(metrcis).forEach((key) => {
                    const sortedMetrics = metrcis[key].sort((a, b) => (a.cvssData.baseScore < b.cvssData.baseScore) ? 1 : a.cvssData.baseScore > b.cvssData.baseScore ? -1 : 0);
                    filteredMetrics.push(sortedMetrics[0])
                  })
        
                  const priorityMetric = filteredMetrics.sort((a, b) => (a.cvssData.baseScore < b.cvssData.baseScore) ? 1 : a.cvssData.baseScore > b.cvssData.baseScore ? -1 : 0)[0];
        
                  cveDataCopy = {
                    ...cveDataCopy,
                    metrics: {
                      [Object.keys(metrcis)[0]]: [{ ...priorityMetric }]
                    }
                  }
                  severity = priorityMetric.cvssData.baseSeverity ?? priorityMetric.baseSeverity
                  let saveCveData = {
                    date: cveData.cve.published, cveId: cveData.cve.id, cveDetails: cveData,
                    seviarity: severity, month: month, year: year, fix: 'N',"type":"Published"
                  };
                  LogCve.create(saveCveData);
                } else {
                  let saveCveData = {
                    date: cveData.cve.published, cveId: cveData.cve.id, cveDetails: cveData,
                    seviarity: severity, month: month, year: year, fix: 'N',"type":"Published"
                  };
                  LogCve.create(saveCveData);
                }
        
              });
        
            }).catch(error => console.log(error))


    } catch (error) {

    }
};


export const getNistLogs = async (request, response) => {
  const { fromDate, toDate } = request.body;
  const getDateRangeQuery = () => {
    if (!fromDate && !toDate) {
      // Get the current date
      const dateTime = new Date();
      const year = dateTime.getFullYear();
      const month = ("0" + (dateTime.getMonth() + 1)).slice(-2);
      const date = ("0" + dateTime.getDate()).slice(-2);

      // Go back by a duration (e.g., 1 month by default)
      const duration = 1; // Example: 1 month duration
      dateTime.setMonth(dateTime.getMonth() - duration);

      const oldYear = dateTime.getFullYear();
      const oldMonth = ("0" + (dateTime.getMonth() + 1)).slice(-2);
      const oldDate = ("0" + dateTime.getDate()).slice(-2);

      return {
        timestamp: { $gte: new Date(`${oldYear}-${oldMonth}-${oldDate}`), $lte: new Date(`${year}-${month}-${date}`) }
      };
    } else {
      return {
        timestamp: { $gte: new Date(fromDate), $lte: new Date(toDate) }
      };
    }
  };
  try {
    const dateRangeQuery = getDateRangeQuery();
    const logs = await NistLog.find(dateRangeQuery); // Apply the date filter here
    response.json(logs);
  } catch (error) {
    response.status(500).json({ error: 'Error fetching logs from nistlogs collection' });
  }
};


export const getSystemLogs = async (request, response) => {
  const { fromDate, toDate } = request.body;

  const getDateRangeQuery = () => {
    if (!fromDate && !toDate) {
      // Get the current date
      const dateTime = new Date();
      const year = dateTime.getFullYear();
      const month = ("0" + (dateTime.getMonth() + 1)).slice(-2);
      const date = ("0" + dateTime.getDate()).slice(-2);

      // Go back by a duration (e.g., 1 month by default)
      const duration = 1; // Example: 1 month duration
      dateTime.setMonth(dateTime.getMonth() - duration);

      const oldYear = dateTime.getFullYear();
      const oldMonth = ("0" + (dateTime.getMonth() + 1)).slice(-2);
      const oldDate = ("0" + dateTime.getDate()).slice(-2);

      return {
        timestamp: { $gte: new Date(`${oldYear}-${oldMonth}-${oldDate}`), $lte: new Date(`${year}-${month}-${date}`) }
      };
    } else {
      return {
        timestamp: { $gte: new Date(fromDate), $lte: new Date(toDate) }
      };
    }
  };
  try {
    const dateRangeQuery = getDateRangeQuery();
    const logs = await SystemLog.find(dateRangeQuery); // Fetch all logs from `nistlogs`
    response.json(logs);
} catch (error) {
  response.status(500).json({ error: 'Error fetching logs from systemlogs collection' });
}
};

export const getUserActivityLogs = async (request, response) => {
  const { fromDate, toDate } = request.body;
// console.log("ffff",fromDate,"enddd",toDate)
  const getDateRangeQuery = () => {
    if (!fromDate && !toDate) {
      // Get the current date
      const dateTime = new Date();
      const year = dateTime.getFullYear();
      const month = ("0" + (dateTime.getMonth() + 1)).slice(-2);
      const date = ("0" + dateTime.getDate()).slice(-2);

      // Go back by a duration (e.g., 1 month by default)
      const duration = 1; // Example: 1 month duration
      dateTime.setMonth(dateTime.getMonth() - duration);

      const oldYear = dateTime.getFullYear();
      const oldMonth = ("0" + (dateTime.getMonth() + 1)).slice(-2);
      const oldDate = ("0" + dateTime.getDate()).slice(-2);

      return {
        timestamp: { $gte: new Date(`${oldYear}-${oldMonth}-${oldDate}`), $lte: new Date(`${year}-${month}-${date}`) }
      };
    } else {
      return {
        timestamp: { $gte: new Date(fromDate), $lte: new Date(toDate + "T23:59:59.999Z") }
      };
    }
  };
  try {
    const dateRangeQuery = getDateRangeQuery();
    const logs = await UserActivityLog.find(dateRangeQuery); // Fetch all logs from `nistlogs`
    response.json(logs);
} catch (error) {
  response.status(500).json({ error: 'Error fetching logs from userActivitylogs collection' });
}
};

export const getSchedulerLogs = async (request, response) => {
  const { fromDate, toDate } = request.body;

  const getDateRangeQuery = () => {
    if (!fromDate && !toDate) {
      // Get the current date
      const dateTime = new Date();
      const year = dateTime.getFullYear();
      const month = ("0" + (dateTime.getMonth() + 1)).slice(-2);
      const date = ("0" + dateTime.getDate()).slice(-2);

      // Go back by a duration (e.g., 1 month by default)
      const duration = 1; // Example: 1 month duration
      dateTime.setMonth(dateTime.getMonth() - duration);

      const oldYear = dateTime.getFullYear();
      const oldMonth = ("0" + (dateTime.getMonth() + 1)).slice(-2);
      const oldDate = ("0" + dateTime.getDate()).slice(-2);

      return {
        timestamp: { $gte: new Date(`${oldYear}-${oldMonth}-${oldDate}`), $lte: new Date(`${year}-${month}-${date}`) }
      };
    } else {
      return {
        timestamp: { $gte: new Date(fromDate), $lte: new Date(toDate) }
      };
    }
  };
  try {
    const dateRangeQuery = getDateRangeQuery();
    const logs = await SchedulerLog.find(dateRangeQuery); // Fetch all logs from `nistlogs`
    response.json(logs);
} catch (error) {
  response.status(500).json({ error: 'Error fetching logs from schedulerlogs collection' });
}
};


