import rp  from "request-promise";
import OemModel from '../model/oemSchema.js';
const maxRetries = 10;
var regex;
var options = {
  'method': 'POST',
  'url': 'https://www.dell.com/support/security/en-in/Security/DdsArticle'
};


export const RunDellWebScraping = async () => {

  async function fetchDataWithRetries(url, retries = maxRetries) {
    try {
      await sleep(5000);
      console.log('url-------------', JSON.stringify(url) + '\n');
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
  

  async function processPages() {
  
    const json = await fetchDataWithRetries(options);
    if(json){
      var jsonData = JSON.parse(json);
      if(jsonData.AdvisoriesModelData){
        for (const i of jsonData.AdvisoriesModelData) {
          var title = i.Title;
          var cve;
          if(i.CVEIdentifier.includes(', ') === true){
            cve = i.CVEIdentifier.split(', ');
          } else {
            cve = i.CVEIdentifier;
            console.log('title ------- '+ title +'\n');
            console.log('cve --------- '+ cve +'\n');
          }
          regex = /(?<=href=")(.*?)(?=">)/g;
          var link = i.RedirectUrl.match(regex) !== null ? i.RedirectUrl.match(regex)[0] : "";
          if(link){
            const html = await fetchDataWithRetries(link);
            if(html){
              regex = /<h3 id="article-content"([\s\S]*?)(?=<div id="rate-article")/g;
              const htmlContent = html.match(regex);
              if(htmlContent){
                regex = /class="(.*?)"/g;
                var cleanHtml = htmlContent[0].replace(regex, '');  // to clean the html code
                if(cleanHtml.includes('<script')){
                  regex = /<script([\s\S]*?)<\/script>/g;
                  cleanHtml = htmlContent[0].replace(regex, '');  // to clean the html code
                }
                if(cve.constructor === Array){
                  cve.forEach( i => {
                    console.log('title ------- '+ title +'\n');
                    console.log('cve --------- '+ i +'\n');
                    console.log('html content ---------- '+ cleanHtml +'\n');
                    OemModel.create({"oemName":'Dell',"cve":i,"content":cleanHtml});
                  })
                } else {
                  console.log('html content ---------- '+ cleanHtml +'\n');
                  OemModel.create({"oemName":'Dell',"cve":cve,"content":cleanHtml});
                }
              } else {
                continue;
              }
            } else {
              continue;
            }
          } else {
            continue;
          }
        }
      } else {
        console.log('json is empty');
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