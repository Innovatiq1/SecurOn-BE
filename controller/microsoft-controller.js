import puppeteer  from "puppeteer";
const url = 'https://learn.microsoft.com/en-us/DeployEdge/microsoft-edge-relnotes-security#november-16-2023';
const maxRetries = 10;
var regex;
var totalCount;
var initialCount;
import OemModel from '../model/oemSchema.js';

export const RunMicroSoftWebScraping = async () => {

async function fetchDataWithRetries(url, retries = maxRetries) {
  try {
    await sleep(5000);
    const html = await url.content();
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
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const jsonData = await fetchDataWithRetries(page);

    if (jsonData) {
      regex = /<div class="content ">([\s\S]*?)<footer id="footer-interactive"/g;
      const mainContent = jsonData.match(regex) !== null ? jsonData.match(regex)[0] : "";
      regex = /(?<=<a href=")(.*?)(?=" data-linktype="external">C)/g;
      const links = mainContent.match(regex);
      if (links !== null && links.length > 0) {
        for (const eachLink of links) {
          await page.goto(eachLink, { waitUntil: 'domcontentloaded' });
          var jsonData2 = await fetchDataWithRetries(page);
          if(jsonData2){
            regex = /(?<=<title>)(.*?)(?=<\/title>)/g;  // regex to get cve number from title of the page
            var cve = jsonData2.match(regex) !== null ? jsonData2.match(regex)[0] : "";
            regex = /(CVE-\d{4}-\d{4,7})/g; // regex to clean the title and get only cve number
            cve = cve.match(regex) !== null ? cve.match(regex)[0] : "";
            regex = /(?<=<h1(.*?)>)([\s\S]*?)(?=<\/h1>)/g;  // regex to get the title of the content
            var title = jsonData2.match(regex) !== null ? jsonData2.match(regex)[0] : "";
            console.log("title ------", title+'\n');
            console.log("cve --------", cve+'\n');
            console.log("link -------", eachLink+'\n');
            regex = /(?<=\/ol>)([\s\S]*?)<label id="msgBarLabel">/g;  // regex to get the content
            jsonData2 = jsonData2.match(regex) !== null ? jsonData2.match(regex)[0] : "";
            regex = /class="(.*?)"/g; // regex to remove class
            jsonData2 = jsonData2.replace(regex, '');
            console.log('html content -------', jsonData2+'\n');

            OemModel.create({"oemName":'Microsoft',"cve":cve,"content":"",  "fixLink":eachLink});

          }
        }
      }
    } else {
      console.log('Main page is empty');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
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