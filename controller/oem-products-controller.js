import OemCpeModel from '../model/oemProductsSchema.js';
import OemListModel from '../model/oemListSchema.js';
import axios from "axios";
export const runOemProductsScheduler = async (request, response) => {

    // const onemList = await OemListModel.find({"oemName":"Cisco"});
   // const onemList = [{ }]
   const onemList = await OemListModel.find({});

    for (const oem of onemList) {

        
        let url = `https://services.nvd.nist.gov/rest/json/cpes/2.0?keywordSearch=${oem.oemName}`;
      
        axios.get(
            url,
            { headers: { 'apikey': '2d3a2cf2-1934-4620-bce2-f69b9e5dfb43' } })

            .then(response => {

                let cpeDetails = response.data;
                let products = cpeDetails.products;
                let count =0;
              //  for (let prod of products) {
                products.forEach(async (prod) => {
                    count = count+1;
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
                        num = num + 1;
                        if(prod.cpe.cpeName.includes('\\') ){

                             modifiedCpeName = prod.cpe.cpeName.replace(/\\/g, '%5C');


                        }
        
                        let saveCpeData = {
                            oemName: oem.oemName, cpeNameId: prod.cpe.cpeNameId, cpeName: modifiedCpeName,
                            productType: productType, title: title.toLowerCase(), cpeDetails: prod.cpe, version: version
                        };
                        const prodData = await OemCpeModel.findOne({ cpeNameId: prod.cpe.cpeNameId });

                       
                        if (!prodData) {
                            OemCpeModel.create(saveCpeData);
                        }
                        
                    }
                //}
      
                
            });
            }).catch(error => console.log(error))
    }

};


