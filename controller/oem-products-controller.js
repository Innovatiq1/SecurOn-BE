import OemCpeModel from '../model/oemProductsSchema.js';
import OemListModel from '../model/oemListSchema.js';
import axios from "axios";
import { systemLogger,userActivityLogger,runOemProductsSchedulerLogger } from '../helpers/loggers.js';

export const runOemProductsScheduler = async (request, response) => {
    runOemProductsSchedulerLogger.info('OEM Product Scheduler has started to fetch products from NIST for the uploaded OEMs')
    // const onemList = await OemListModel.find({"oemName":"Cisco"});
   // const onemList = [{ }]
   const onemList = await OemListModel.find({});
console.log("oemLists",onemList)
    for (const oem of onemList) {

        const version = "17.2.2"
        // let url = `https://services.nvd.nist.gov/rest/json/cpes/2.0?keywordSearch=${oem.oemName}`;
        let url = `https://services.nvd.nist.gov/rest/json/cpes/2.0?keywordSearch=${version}`;
        axios.get(
            url,
            { headers: { 'apikey': '2d3a2cf2-1934-4620-bce2-f69b9e5dfb43' } })

            .then(response => {
                console.log("respos",response)
                runOemProductsSchedulerLogger.info(`Successfully accessed the API to fetch products for the ${oem.oemName}`)
                let cpeDetails = response.data;
                let products = cpeDetails.products;
                runOemProductsSchedulerLogger.info(`Fetched ${products.length} products for the ${oem.oemName} from the NIST`)

                let count =0;
              //  for (let prod of products) {
                products.forEach(async (prod) => {
                    count = count+1;
                    console.log("prodCount:", prod)
                    if (!prod.cpe.deprecated) {
                        let text = prod.cpe.cpeName;
                        const myArray = text.split(":");

                        var title = myArray[4];
                        title = title.replace(/_/g, " ");
                        title =  title.replace('\\', '');
                        var version = myArray[5];
                        if(version.includes('\\') ){
                            version = version.replace(/\\/g, '')
                        }
                        var productType = myArray[2];
                        let modifiedCpeName = prod.cpe.cpeName;
                        let num = 0;
                         num = num + 1;
                        if(prod.cpe.cpeName.includes('\\') ){

                             modifiedCpeName = prod.cpe.cpeName.replace(/\\/g, '%5C');


                        }
        
                        let saveCpeData = {
                            oemName: oem.oemName, cpeNameId: prod.cpe.cpeNameId, cpeName: modifiedCpeName,
                            productType: productType, title: title.toLowerCase(), cpeDetails: prod.cpe, version: version
                        };

                        // console.log("savedata",saveCpeData)
                        const prodData = await OemCpeModel.findOne({ cpeNameId: prod.cpe.cpeNameId });
                        // console.log("savedata12",prodData)
                       
                        if (!prodData) {
                            console.log("savedata12savedata12savedata12",saveCpeData)
                            OemCpeModel.create(saveCpeData);
                        }
                        
                    }
               
      
                
            });
            runOemProductsSchedulerLogger.info(`Stored new products for ${oem.oemName} in the database`);

            }).catch(error => {
                systemLogger.error(error)
                console.log(error)})
    }

};


