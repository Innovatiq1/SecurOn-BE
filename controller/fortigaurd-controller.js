const url = 'https://www.fortiguard.com/psirt';
import rp  from "request-promise";
var regex;
import OemModel from '../model/oemSchema.js';

export const RunFortiGaurdWebScraping = async () => {
rp(url)
.then(function(html){
  if(html) {
    regex = /(ul class="pagination pagination-desktop")([\s\S]*?)<\/ul>/g;
    const page = html.match(regex); // regex to get pagination
    if(page){
      regex = /<a class="page-link" .*?>(\d+)<\/a>/g;
      const extractedDigits = [];
      let match;
      var regex2 = /<a class="page-link" .*?<span>(\d+)<\/span>/g; // get all the pages numbers in an array
      
      while ((match = regex2.exec(page[0])) !== null) {
        extractedDigits.push(match[1]);
      }
      while ((match = regex.exec(page[0])) !== null) {
        extractedDigits.push(match[1]);
      }
      extractedDigits.forEach(i => {
        rp(`https://www.fortiguard.com/psirt?page=${i}&product=FortiOS-6K7K,FortiOS`)
        .then(function(html2){
          regex = /(?<=<div class="results">)([\s\S]*?)(?=<nav aria-label="Page navigation">)/g;
          const matches = html2.match(regex);

          if (matches) {
            regex = /(?<=<div class="title">)([\s\S]*?)<\/a>/g;
            const lists = matches[0].match(regex); // regex to get all the title and link to an array
            if(lists){
              lists.forEach(i => {
                regex = /(?<=<a href=")(.*?)(?=">)/g;
                var link = i.match(regex);  // regex to get link to get the html content
                var regex1 = /(?<=<a href=".*?">)(.*?)(?=<\/a>)/g;
                var title = i.match(regex1); // regex to get title
                if(link){
                  rp('https://www.fortiguard.com'+link[0])
                  .then(function(html3){
                    if(html3){
                      regex = /(?<=<section class="ency_content">[\s\S]*?<\/div>)([\s\S]*?)(?=<\/section>)/g;
                      const matches2 = html3.match(regex); // regex to get html content
                      if(matches2){
                        var regex = /<table.*?class="table table-responsive table-borderless">([\s\S]*?)<\/table>/g;
                        const table = html3.match(regex);
                        if(table){
                          regex = /(?<=<td>CVE ID<\/td>[\s\S]*?target="_blank">)([\s\S]*?)(?=<\/a>)/g;
                          var cve = table[0].match(regex) !== null ? table[0].match(regex)[0]: ''; //regex to get the cve id
                         // console.log("title------", title[0]);
                          //console.log('html content-----', matches2[0]);
                          //console.log('cve -----', cve);
                          
                          OemModel.create({"oemName":'FortiGuard',"cve":cve,"content":matches2[0]});

                        }
                      }
                    }
                  })
                  .catch(function(err){
                    console.log("error :", err);
                  });
                }
              })
            }
          }
        })
        .catch(function(err){
          console.log("error :", err);
        });
      })
    }
  } else {
    console.log("main page is empty");
  }
})
.catch(function(err){
  console.log("error :", err);
});

};
  
  