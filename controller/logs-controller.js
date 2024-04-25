import LogCve from '../model/logsSchema.js';
import escapeStringRegexp from 'escape-string-regexp';
import axios from "axios";


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

