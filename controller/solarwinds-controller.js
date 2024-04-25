import rp  from "request-promise";
const url = 'https://www.solarwinds.com/trust-center/security-advisories';
import OemModel from '../model/oemSchema.js';
const maxRetries = 10;
var regex;
var count = 0;

export const RunSolarWindsWebScraping = async () => {
async function fetchDataWithRetries(url, retries = maxRetries) {
  try {
    console.log('url-------------', url + '\n');
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

async function processPages() {
  const html = await fetchDataWithRetries(url);
  if (html) {
    regex = /<table class="w-full (.*?)">([\s\S]*?)<\/table>/g;
    const table = html.match(regex);  // regex to list of datas to be scrapped
    if (table) {
      regex = /<td scope="row"([\s\S]*?)<\/p>/g;  // get all the titles and links
      const lists = table[0].match(regex);
      if(lists) {
        for (const i of lists) {
          regex = /(?<=<p(.*?)<a href="(.*?)">)(.*?)(?=<\/a)/g; // regex to get the cve number which is also the url link
          var cve = i.match(regex) !== null ? i.match(regex)[0] : "";
          if(cve.includes('span')){
            regex = /(?<=<span>)(.*?)(?=<\/span)/g;
            cve = cve.match(regex) !== null ? cve.match(regex)[0] : "";
          }
          regex = /(?<=<a class="(.*?)security-advisories)(.*?)(?=">)/g; // regex to get the cve number which is also the url link
          var link = i.match(regex) !== null ? i.match(regex)[0] : "";
          regex = /(?<=<a class="(.*?)">)(.*?)(?=<\/a)/g;
          var title = i.match(regex) !== null ? i.match(regex)[0] : ""; // regex to get the title
          if(link) {
            const html2 = await fetchDataWithRetries(url+link);
            if (html2) {
              count = count + 1;
              regex = /<div class="sw-container ([\s\S]*?)(?=<\/main)/g;
              const matches = html2.match(regex); // regex to get the html code
              if(matches) {
                regex = /(?<=Advisory ID(.*?)<a href="(.*?)">)(.*?)(?=<\/a>(.*?)First Published)/g;
                regex = /class="(.*?)"/g;
                const cleanHtml = matches[0].replace(regex, '');  // to clean the html code
                console.log("title------", title + '\n');
                console.log("link-------", url+link+'\n');
                console.log('html content-----', cleanHtml + '\n');
                console.log('cve -----', cve + '\n');
                let cveObj = await OemModel.findOne({ cve: cve,"oemName":'SolarWinds'});
                if(cveObj){
                    console.log("Cve ID already Exists");
                }else{
                  OemModel.create({"fixLink":url+link,"oemName":'SolarWinds',"cve":cve,"content":cleanHtml});
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
      }
    }
  } else {
    console.log('Main page is empty');
  }
}

processPages()
  .then(() => {
    console.log('Scrapping completed.', count);
    return;
    })
  .catch((err) => {
    console.log('Error:', err);
  });

}