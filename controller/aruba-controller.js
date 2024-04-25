import rp  from "request-promise";
import zlib  from "zlib";
import OemModel from '../model/oemSchema.js';
var url = 'https://www.arubanetworks.com';
var count = 0;
var options = {
  'method': 'GET',
  'url': url+'/sea/support-services/security-bulletins/',
  'headers': {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/118.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Cookie': 'aruba_gdpr_en=en%7C1; drift_campaign_refresh=3784cae3-f9bb-47dc-8066-7a155ed662ee; drift_aid=07d84f95-8239-49df-b7ca-772a6cba50ba; driftt_aid=07d84f95-8239-49df-b7ca-772a6cba50ba',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'cross-site',
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache'
  },
  'encoding': null
};
const maxRetries = 10;
var regex;
export const RunArubaWebScraping = async () => {

  async function fetchDataWithRetries(url, retries = maxRetries) {
    try {
      await sleep(5000);
      console.log('url-------------', JSON.stringify(url));
      var html = await rp(url);
      html = await gunzipAsync(html);  //function to decrypt the data fetched
      return html.toString();
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying request. Retries left: ${retries}`, error);
        await sleep(1000);
        return fetchDataWithRetries(url, retries - 1);
      } else {
        throw new Error('Maximum retries reached. Unable to fetch data.');
      }
    }
  }
  function gunzipAsync(data) {
    return new Promise((resolve, reject) => {
      zlib.gunzip(data, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  
  async function processPages() {
    var html = await fetchDataWithRetries(options);
    if (html) {
      regex = /<div class="resource-list resource-ul([\s\S]*?)(?=<script>)/g; // regex to get the list div
      var list = html.match(regex);
      if(list){
        regex = /<a class="sa-heading"([\s\S]*?)<div class="block-text">/g; //regex to get the each datas to be scrapped
        var matches = list[0].match(regex);
        if(matches){
          for(const i of matches) {
            regex = /(?<=href=")([\s\S]*?)(?=")/g; // regex to get the link
            var link = i.match(regex) !== null ? i.match(regex)[0] : "";
            regex = /(?<=<a class="sa-heading"(.*?)">)([\s\S]*?)(?=<\/a>)/g; // regex to get the title
            var title = i.match(regex) !== null ? i.match(regex)[0] : "";
            regex = /(?<=CVE Number: <\/strong>)(.*?)(?=<\/p>)/g;
            var cve = i.match(regex) !== null ? i.match(regex)[0] : ""; // regex to get the cve
            if(cve.includes(', ') === true){
              cve = cve.split(', ')
            } else {
              console.log('title ------- '+ title+'\n');
              console.log('cve ------- '+ cve+'\n');
            }
            if(link && link.includes('pdf') !== true){
              count = count + 1;
              options['url'] = url+link;
              var file = await fetchDataWithRetries(options); //fetching data from the taken link
              if(cve.constructor === Array){
                cve.forEach(i => {
                  console.log('title ------- '+ title+'\n');
                  console.log('cve ------- '+ i+'\n');
                  console.log("text file ------- "+ file+'\n');
                  
                  OemModel.create({"oemName":'Aruba',"cve":i,"content":file});
                })
              } else {
                console.log("text file ------- "+ file+'\n');
                //OemModel.create({"oemName":'Aruba',"cve":i,"content":file});
              }
            } else {
              if(cve.constructor === Array){
                cve.forEach(i => {
                  console.log('title ------- '+ title+'\n');
                  console.log('cve ------- '+ i+'\n');
                })
              }
              continue;
            }
          }
        }
      } else {
        console.log('List to be scarpped is empty');
      }
    } else {
      console.log('Main page is empty');
    }
  }
  
  processPages()
    .then(() => {
      console.log('Scrapping completed.', count);
    })
    .catch((err) => {
      console.log('Error:', err);
    });
  }