import rp  from "request-promise";
const url = 'https://sec.cloudapps.cisco.com/security/center/publicationService.x?criteria=exact&cves=&keyword=&last_published_date=&limit=100&offset=0&publicationTypeIDs=1,3&securityImpactRatings=&sort=-day_sir&title=';
var regex;
import OemModel from '../model/oemSchema.js';
const maxRetries = 10;
var totalCount;
var initialCount;

export const RunCiscoScraping = async () => {

  async function fetchDataWithRetries(url, retries = maxRetries) {
    try {
      console.log('url-------------', url);
      await sleep(5000);
      const html = await rp(url);
      return html;
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying request. Retries left: ${retries}`);
        await sleep(1000);
        return fetchDataWithRetries(url, retries - 1);
      } else {
        throw new Error('Maximum retries reached. Unable to fetch data.');
      }
    }
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function getData(jsonData) {
    for(const eachData of jsonData) {
      var cve;
      var title;
      if(eachData.cve !== undefined && eachData.cve.includes(",")){
        cve = eachData.cve.split(',');
        title = eachData.title;
      } else{
        if(eachData.cve !== undefined){
          console.log("cve -------------", eachData.cve);
        }
        if(eachData.title !== undefined){
          console.log("title -----------", eachData.title);
        }
      }
      var content = await fetchDataWithRetries(eachData.url)
      if(content){
        regex = /(<title>)([\s\S]*?)(?=<hr id="ud-legal-sep">)/g; // regex to get the content
        content = content.match(regex)[0];
        if(content.includes("<style")){
          regex = /<style([\s\S]*?)<\/style>/g; // regex to remove style tag
          content = content.replace(regex, '');
        }
        if(content.includes("<script")){
          regex = /<script([\s\S]*?)<\/script>/g; // regex to remove script tag
          content = content.replace(regex, '');
        }
        if(content.includes("<link")){
          regex = /<link(.*?)>/g; // regex to remove link tag
          content = content.replace(regex, '');
        }
        regex = /class="(.*?)"/g; // regex to remove class
        content = content.replace(regex, '');
        if(cve !== undefined){
          cve.forEach(i => {
            console.log("title -----------",title);
            console.log("cve -------------", i);
            console.log("html content---------", content);
            OemModel.create({"oemName":'Cisco',"cve":i,"content":content});
          })
        } else {
          console.log("html content---------", content);
        }
      }
    }
  }
  async function processPages() {
    var jsonData = await fetchDataWithRetries(url);
    if (jsonData) {
      jsonData = JSON.parse(jsonData);
      initialCount = jsonData.length;
      totalCount = jsonData[0].totalCount;
      await getData(jsonData);
      while(initialCount <= totalCount){
        var jsonData2 = await fetchDataWithRetries('https://sec.cloudapps.cisco.com/security/center/publicationService.x?criteria=exact&cves=&keyword=&last_published_date=&limit=100&offset='+initialCount+'&publicationTypeIDs=1,3&securityImpactRatings=&sort=-day_sir&title=');
        if(jsonData2){
          initialCount = initialCount + jsonData.length;
        }
      }
    } else {
      console.log('Main page is empty');
    }
  }
  processPages()
  .then(() => {
    console.log('Scrapping completed.');
  })
  .catch((err) => {
    console.log('Error:', err);
  });

}