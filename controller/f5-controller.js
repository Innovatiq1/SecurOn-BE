import OemModel from '../model/oemSchema.js';
import rp  from "request-promise";

var options = {
  method: 'POST',
  uri: 'https://my.f5.com/manage/s/sfsites/aura?r=3&aura.ApexAction.execute=1',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  },
  body: 'message=%7B%22actions%22%3A%5B%7B%22id%22%3A%22464%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FApexActionController%2FACTION%24execute%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22namespace%22%3A%22%22%2C%22classname%22%3A%22SiteArticleDetailController%22%2C%22method%22%3A%22getArticlesFromUrls%22%2C%22params%22%3A%7B%22urlNames%22%3A%22K000135479%22%7D%2C%22cacheable%22%3Atrue%2C%22isContinuation%22%3Afalse%7D%7D%5D%7D&aura.context=%7B%22mode%22%3A%22PROD%22%2C%22fwuid%22%3A%22LU1oNENmckdVUXNqVGtLeG5odmktZ2Rkdk8xRWxIam5GeGw0LU1mRHRYQ3cyNDYuMTUuMS0zLjAuNA%22%2C%22app%22%3A%22siteforce%3AcommunityApp%22%2C%22loaded%22%3A%7B%22APPLICATION%40markup%3A%2F%2Fsiteforce%3AcommunityApp%22%3A%228srl03VqKMnukxbiM5O73w%22%2C%22COMPONENT%40markup%3A%2F%2FforceCommunity%3AembeddedServiceSidebar%22%3A%226wtw1s-scZjCHBm2Mfzujg%22%2C%22COMPONENT%40markup%3A%2F%2Finstrumentation%3Ao11ySecondaryLoader%22%3A%22Cpu-nBuFEwwbtqFxYd7Qhw%22%7D%2C%22dn%22%3A%5B%5D%2C%22globals%22%3A%7B%7D%2C%22uad%22%3Afalse%7D&aura.pageURI=%2Fmanage%2Fs%2Farticle%2FK000135479&aura.token=null',
};
const maxRetries = 10;
var regex;

export const RunF5WebScraping = async () => {

async function fetchDataWithRetries(url, retries = maxRetries) {
  try {
    console.log('url-------------', JSON.stringify(url)+'\n');
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
  var html = await fetchDataWithRetries(options);
  if (html) {
    html = JSON.parse(html);
    if(html.actions !== undefined && html.actions[0].state == 'SUCCESS'){
      html = html.actions[0].returnValue.returnValue[0].article.Details__c;
      regex = /<table([\s\S]*?)<\/table>/g;
      const tables = html.match(regex);  // regex to get tables
      if (tables) {
        for(const i of tables){
          regex = /<a href(.*?)<\/a>/g; // regex to get each data
          const matches = i.match(regex);
          for(const j of matches){
            regex = /(?<=<a href.*?"_blank">)(.*?)(?=<\/a>)/g; // regex to get title
            const title = j.match(regex) !== null ? j.match(regex)[0] : "";
            console.log("title --------", title+'\n');
            regex= /CVE(.*)/g; // regex to get cve
            const cve = title.match(regex) !== null ? title.match(regex)[0] : "";
            console.log("cve ---------", cve+'\n');
            regex = /(?<=<a href(.*?)article\/)(.*?)(?=")/g; // regex to get id for listing
            const id = j.match(regex) !== null ? j.match(regex)[0] : "";
            if(id){
              options['body'] = 'message=%7B%22actions%22%3A%5B%7B%22id%22%3A%22465%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FApexActionController%2FACTION%24execute%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22namespace%22%3A%22%22%2C%22classname%22%3A%22SiteArticleDetailController%22%2C%22method%22%3A%22getArticlesFromUrls%22%2C%22params%22%3A%7B%22urlNames%22%3A%22'+id+'%22%7D%2C%22cacheable%22%3Atrue%2C%22isContinuation%22%3Afalse%7D%7D%5D%7D&aura.context=%7B%22mode%22%3A%22PROD%22%2C%22fwuid%22%3A%22LU1oNENmckdVUXNqVGtLeG5odmktZ2Rkdk8xRWxIam5GeGw0LU1mRHRYQ3cyNDYuMTUuMS0zLjAuNA%22%2C%22app%22%3A%22siteforce%3AcommunityApp%22%2C%22loaded%22%3A%7B%22APPLICATION%40markup%3A%2F%2Fsiteforce%3AcommunityApp%22%3A%228srl03VqKMnukxbiM5O73w%22%2C%22COMPONENT%40markup%3A%2F%2FforceCommunity%3AembeddedServiceSidebar%22%3A%226wtw1s-scZjCHBm2Mfzujg%22%2C%22COMPONENT%40markup%3A%2F%2Finstrumentation%3Ao11ySecondaryLoader%22%3A%22Cpu-nBuFEwwbtqFxYd7Qhw%22%7D%2C%22dn%22%3A%5B%5D%2C%22globals%22%3A%7B%7D%2C%22uad%22%3Afalse%7D&aura.pageURI=%2Fmanage%2Fs%2Farticle%2F'+id+'&aura.token=null';
              var html2 = await fetchDataWithRetries(options);
              html2 = JSON.parse(html2);
              if(html2.actions !== undefined && html2.actions[0].state == 'SUCCESS'){
                regex = /class="(.*?)"/g;
                var cleanHtml = html2.actions[0].returnValue.returnValue[0].article.Details__c.replace(regex, '');  // to clean the html code
                regex = /style="(.*?)"/g;
                cleanHtml = cleanHtml.replace(regex, '');
                console.log('html content ---------', cleanHtml+'\n');
                let cveObj = await OemModel.findOne({ cve: cve,"oemName":'F5'});
                if(cveObj){
                    console.log("Cve ID already Exists");
                }else{
                OemModel.create({"oemName":'F5',"cve":cve,"content":cleanHtml});
                }
              }
            }
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
    console.log('Scrapping completed.');
  })
  .catch((err) => {
    console.log('Error:', err);
  });
}