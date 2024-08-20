import Inventory from '../model/inventorySchema.js';
import readXlsxFile from "read-excel-file/node";
import cveModel from '../model/cveSchema.js';
import vendorProductCveModel from '../model/vendorProductCveSchema.js';
import axios from "axios";

export const getAssets = async (request, response) => {
  try {
    const assets = await Inventory.find({}).sort({vendor:1})

    response.json(assets);
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
};

// export const fetchProductCves = async (request, response) => {
//   try {



//     if (request.body != undefined && request.body.brand != undefined &&
//       request.body.product != undefined
//     ) {

//       var brand = request.body.brand;
//       var product = request.body.product;

//       const cves = await vendorProductCveModel.find({ "productName": product.toLowerCase() });


//       let result = cves.filter((a, i) => cves.findIndex((s) => a.cveDetails.cve.id === s.cveDetails.cve.id) === i)
//       response.json(result);
//     }




//   } catch (error) {
//     console.log(error);

//   }
// };

export const fetchProductCves = async (request, response) => {
  try {

    if (request.body != undefined && request.body.brand != undefined &&
      request.body.osType != undefined 
    ) {

     
    //  let product = request.body.product;
      let firmwareVersion = request.body.firmwareVersion;
      if(firmwareVersion==null ||  firmwareVersion==''){
        firmwareVersion ="-";
        }else{

              if (!firmwareVersion.includes('.')) {
                                
                firmwareVersion = parseFloat(firmwareVersion).toFixed(1);
          }
          // else{
          //   firmwareVersion = asset.firmwareVersion;
          // }
        }
      
      let cvesList ;
     // cvesList = await vendorProductCveModel.find({ "productName": product.toLowerCase(),"version": firmwareVersion});
     
         // if(cvesList.length==0){
          
            let partNo = request.body.partNo;
            cvesList = await vendorProductCveModel.find({ "productName": partNo.toLowerCase(),"version": firmwareVersion });
          //}     
          
          if(cvesList.length==0){
           
            cvesList = await vendorProductCveModel.find({ "productName": partNo.toLowerCase(),"version": "-" });
          }

          if (cvesList.length ==0) {
           
            let osType = request.body.osType;
          //  cvesList = await vendorProductCveModel.find({ "productName":  product.toLowerCase() });

          cvesList = await vendorProductCveModel.find({ "osType": osType, "productName": partNo.toLowerCase(), "version": firmwareVersion });
                        if (cvesList.length == 0) {
                          
                          cvesList = await vendorProductCveModel.find({ "osType": osType, "version": firmwareVersion });
                        }

            }
          
      let result = cvesList.filter((a, i) => cvesList.findIndex((s) => a.cveDetails.cve.id === s.cveDetails.cve.id) === i)
      
      
      response.json(result);
    }




  } catch (error) {
    console.log(error);

  }
};

// export const deleteAssets = async (request, response) => {
//   try {

//     for (const asset of request.body.assets) {

//       await Inventory.findByIdAndDelete(asset._id);

//     }

//     return response.status(201).json({
//       success: true,
//       message: " Asset(s) deleted successfully",
//     });
//   } catch (error) {
//     console.log(error);

//   }
// };

export const deleteAssets = async (request, response) => {
  try {
    for (const asset of request.body.assets) {
      const assetFilter = { vendor: asset.vendor, osType: asset.osType, project:asset.project , partNo: asset.partNo};
      const assetCount = await Inventory.countDocuments(assetFilter);
      if (assetCount > 1) {
        await Inventory.findByIdAndDelete(asset._id);
      } else {
        const vendorFilter = { vendorName: asset.vendor, osType: asset.osType, project: asset.project, partNo: asset.partNo };
        const vendorProducts = await vendorProductCveModel.find(vendorFilter); 
        for (const product of vendorProducts) {
          await vendorProductCveModel.findByIdAndDelete(product._id);
        }
        await Inventory.findByIdAndDelete(asset._id);
      }
    }

    return response.status(201).json({
      success: true,
      message: "Asset(s) deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      success: false,
      message: "An error occurred while deleting the assets.",
    });
  }
};

export const uploadAssets = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send("Please upload an excel file!");
    }

    const path = req.file.path;
    const fileName = req.file.filename;
    const substr = fileName.split("-")[2];
    const projectName = substr.split(".")[0];

    const rows = await readXlsxFile(path);

    if (rows.length === 0) {
      return res.status(400).send("The uploaded file is empty!");
    }

    rows.shift(); // Remove the header row

    let totalCount = 0;
    let insertedCount = 0;
    const inventories = [];

    for (const row of rows) {
      totalCount += 1;
      const inventory = {
        vendor: row[0],
        osType: row[1],
        partNo: row[2],
        product: row[3],
        type: row[4],
        serialNo: row[5],
        firmwareVersion: row[6],
        cpeName: '',
        vulnarabilities: 0,
        status: 'A',
        project: projectName,
      };

      const existingInventory = await Inventory.findOne({
        project: inventory.project,
        vendor: inventory.vendor,
        partNo: inventory.partNo,
        product: inventory.product,
        type: inventory.type,
        serialNo: inventory.serialNo,
        firmwareVersion: inventory.firmwareVersion,
        osType: inventory.osType,
      });

      if (!existingInventory) {
        inventories.push(inventory);
        insertedCount += 1;
      }
    }

    if (inventories.length > 0) {
      await Inventory.insertMany(inventories);
    }

    return res.status(201).json({
      success: true,
      message: `Total Excel Records are ${totalCount} and ${insertedCount} Asset(s) uploaded successfully`,
    });
  } catch (err) {
    // logger.error(`Error uploading assets: ${err.message}`);
    return res.status(500).json({ success: false, message: err.message });
  }
};


// export const uploadAssets = async (req, res, next) => {
//   try {

//     let path = req.file.path;

//     var fileName = req.file.filename;
//     var substr = fileName.split("-")[2];
//     var projectName = substr.split(".")[0];
//     if (req.file == undefined) {
//       return res.status(400).send("Please upload an excel file!");
//     }

//     readXlsxFile(path).then(async (rows) => {

//       rows.shift();
//       let inventories = [];
//       var totalCount = 0;
//       var insertedCount = 0;
//       for (const row of rows) {
//         totalCount = totalCount + 1;
//         let inventory = {
//           //vendor: row[0].toLowerCase(),
//           vendor: row[0],
//           osType: row[1],
//           partNo: row[2],
//           // product: row[2].toLowerCase(),
//           product: row[3],
//           type: row[4],
//           serialNo: row[5],
//           firmwareVersion: row[6],
//           cpeName: '',
//           vulnarabilities: 0,
//           status: 'A',
//           project: projectName
//         };
        
//         const inven = await Inventory.findOne({
//           "project":inventory.project,"vendor": inventory.vendor, "partNo": inventory.partNo, "product": inventory.product, "type": inventory.type, "serialNo": inventory.serialNo,
//           "firmwareVersion": inventory.firmwareVersion,"osType":inventory.osType
//         });

//         if(inven){
//           console.log("asset already exists")
//             }
//             else {
//           insertedCount = insertedCount + 1;
//           await Inventory.create(inventory);
//         }

//         if (rows.length == totalCount) {

//           return res.status(201).json({
//             success: true,
//             message: "Total Excel Records are " + totalCount + " and " + insertedCount + " Asset(s) uploaded successfully",
//           });
//         }

//       }

//     });
//     // return res.status(201).json({
//     //       success: true,
//     //       message: " Asset(s) uploaded successfully",
//     //     });

//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

export const updateAsset = async (request, response) => {
  try {

    //console.log("&&&&&&&"+request.body._id);

    let status = 'I';
    if (request.body.status) {
      status = 'A';
    }
    const assets = await Inventory.findOne({
      project: request.body.project, vendor: request.body.vendor, partNo: request.body.partNo,
      product: request.body.product,
      type: request.body.type, serialNo: request.body.serialNo, firmwareVersion: request.body.firmwareVersion,
       status: status,osType:request.body.osType
    });

    if (!assets || (assets != null && assets != undefined && assets._id != request.body._id)) {

      await Inventory.findByIdAndUpdate(request.body._id,
        {
          project: request.body.project, vendor: request.body.vendor, product: request.body.product, partNo: request.body.partNo,
          type: request.body.type, serialNo: request.body.serialNo, firmwareVersion: request.body.firmwareVersion,
           status: status,osType:request.body.osType
        });
      return response.status(201).json({
        success: true,
        message: " asset updated successfully",
      });
    } else {
      return response.status(201).json({
        success: true,
        message: " asset already exists with same combination",
      });

    }


  } catch (error) {
    return response.status(500).json({
      success: true,
      message: "Error in updating Asset"

    });
  }
}
