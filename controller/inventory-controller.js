import Inventory from '../model/inventorySchema.js';
import readXlsxFile from "read-excel-file/node";
import cveModel from '../model/cveSchema.js';
import vendorProductCveModel from '../model/vendorProductCveSchema.js';
import axios from "axios";
import { systemLogger,userActivityLogger } from '../helpers/loggers.js';




export const getAssets = async (request, response) => {
  try {
    const { startDate, endDate } = request.query;
    let dateFilter = {};
    let startOfDay, endOfDay;

    if (startDate && endDate) {
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return response.status(400).json({ error: "Invalid date format" });
      }

      startOfDay = new Date(parsedStartDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      endOfDay = new Date(parsedEndDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      dateFilter = { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() };
    }

    // Step 1: Fetch all assets
    const assets = await Inventory.find().lean();

    if (!assets.length) {
      return response.json([]);
    }

    // Step 2: Create query conditions (excluding serialNo)
    const queryConditions = assets.map(asset => ({
      vendorName: asset.vendor,
      version: asset.firmwareVersion,
      osType: asset.osType,
      partNo: asset.partNo,serialNo:asset.serialNo
    }));

    // Step 3: Fetch vulnerabilities and group (excluding serialNo)
    const vulnerabilities = await vendorProductCveModel.aggregate([
      {
        $match: {
          $or: queryConditions,
          ...(startOfDay && endOfDay ? { date: dateFilter } : {})
        }
      },
      {
        $group: {
          _id: {
            partNo: "$partNo",
            firmwareVersion: "$version"
          },
          uniqueCveIds: { $addToSet: "$cveId" }  // ensure uniqueness
        }
      },
      {
        $project: {
          _id: 1,
          count: { $size: "$uniqueCveIds" }  // get actual unique CVE count
        }
      }
    ]);
    
    // Step 2: Create a map: partNo_version => unique count
    const vulnerabilitiesMap = vulnerabilities.reduce((acc, v) => {
      const key = `${v._id.partNo}_${v._id.firmwareVersion}`;
      acc[key] = v.count;
      return acc;
    }, {});
    
    // Step 3: Add the correct count to each asset
    const updatedAssets = assets.map(asset => {
      const key = `${asset.partNo}_${asset.firmwareVersion}`;
      return {
        ...asset,
        vulnerabilitiesCount: vulnerabilitiesMap[key] || 0
      };
    });
    
    response.json(updatedAssets);
    

  } catch (error) {
    console.error("Error:", error);
    return response.status(500).json({ error: error.message });
  }
};


export const getAssetsByBrand = async (request, response) => {
  try {
    const { vendor, fromDate, toDate } = request.body;

    if (!vendor) {
      return response.status(400).json({ error: "Vendor is required" });
    }

    try {
      const inventoryAssets = await Inventory.find({ vendor });
      let dateFilter = {};
      if (fromDate && toDate) {
        const parsedStartDate = new Date(fromDate);
        const parsedEndDate = new Date(toDate);

        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
          return response.status(400).json({ error: "Invalid date format" });
        }

        const startOfDay = new Date(parsedStartDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(parsedEndDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        dateFilter = { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() };
      }

      const uniqueAssets = [];
      const seenPartNos = new Set();
      const seenOsTypes = new Set();

      for (const asset of inventoryAssets) {
        const normalizedPartNo = asset.partNo?.trim(); 
        const normalizedOsType = asset.osType?.trim(); 
        let isDuplicate = false;

        if (["Cisco", "Solarwinds"].includes(asset.vendor)) {
          if (normalizedPartNo && seenPartNos.has(normalizedPartNo)) {
            isDuplicate = true;
          } else {
            seenPartNos.add(normalizedPartNo);
          }
        }

        if (["F5", "Fortinet"].includes(asset.vendor)) {
          if (normalizedOsType && seenOsTypes.has(normalizedOsType)) {
            isDuplicate = true;
          } else {
            seenOsTypes.add(normalizedOsType);
          }
        }

        if (!isDuplicate) {
          uniqueAssets.push({
            ...asset.toObject(),
            partNo: normalizedPartNo,
            osType: normalizedOsType,
          });
        }
      }

      const filteredAssets = await Promise.all(
        uniqueAssets.map(async (asset) => {
          if (!asset.vendor || (!asset.partNo && !asset.osType)) {
            return null;
          }
      
          const query =
            ["F5", "Fortinet"].includes(asset.vendor)
              ? {
                  vendorName: asset.vendor, 
                  osType: new RegExp(`^${asset.osType}$`, "i"), 
                  ...(fromDate && toDate
                    ? { date: { $gte: fromDate, $lte: toDate } }
                    : { date: { $exists: true } }),
                }
              : {
                  vendorName: asset.vendor, 
                  partNo: new RegExp(`^${asset.partNo}$`, "i"),
                  ...(fromDate && toDate
                    ? { date: { $gte: fromDate, $lte: toDate } }
                    : { date: { $exists: true } }),
                };
      
          // console.log("query", query);
      
          const vulnerabilitiesCount = await vendorProductCveModel.countDocuments(query);
      
          // console.log("Total", vulnerabilitiesCount);
      
          if (vulnerabilitiesCount > 0) {
            return {
              ...asset,
              vulnerabilitiesCount,
            };
          }
          return null;
        })
      );

      const finalAssets = filteredAssets.filter((asset) => asset !== null);

      response.json(finalAssets);
    } catch (error) {
      console.error("Error:", error);
      response.status(500).json({ error: "An error occurred while processing assets" });
    }
  } catch (error) {
    console.error("Error:", error);
    return response.status(500).json({ error: error.message });
  }
};

export const getAssetsByTypeAndDate = async (request, response) => {
  try {
    const { type, fromDate, toDate } = request.body;

    if (!type) {
      return response.status(400).json({ error: "Type is required" });
    }

    let dateFilter = {};
    if (fromDate && toDate) {
      const parsedStartDate = new Date(fromDate);
      const parsedEndDate = new Date(toDate);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return response.status(400).json({ error: "Invalid date format" });
      }

      const startOfDay = new Date(parsedStartDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(parsedEndDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      dateFilter = { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() };
    }

    const filterCriteria = {
      type,
      ...(fromDate && toDate ? { date: dateFilter } : {}),
    };

    const filteredRecords = await Inventory.find(filterCriteria);

    if (filteredRecords.length === 0) {
      return response.status(404).json({ message: "No records found" });
    }

    response.json(filteredRecords);
  } catch (error) {
    console.error("Error:", error);
    response.status(500).json({ error: "An error occurred while processing records" });
  }
};



export const getAssetsByBrandName = async (request, response) => {
  try {
    const { vendor, fromDate, toDate } = request.body;

    if (!vendor) {
      return response.status(400).json({ error: "Type is required" });
    }

    let dateFilter = {};
    if (fromDate && toDate) {
      const parsedStartDate = new Date(fromDate);
      const parsedEndDate = new Date(toDate);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return response.status(400).json({ error: "Invalid date format" });
      }

      const startOfDay = new Date(parsedStartDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(parsedEndDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      dateFilter = { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() };
    }

    const filterCriteria = {
      vendor,
      ...(fromDate && toDate ? { date: dateFilter } : {}),
    };

    const filteredRecords = await Inventory.find(filterCriteria);

    if (filteredRecords.length === 0) {
      return response.status(404).json({ message: "No records found" });
    }

    response.json(filteredRecords);
  } catch (error) {
    console.error("Error:", error);
    response.status(500).json({ error: "An error occurred while processing records" });
  }
};

export const getOnlyAssets = async (request, response) => {
  // console.log("rrrr",request)
  try {
    const { startDate, endDate } = request.query;

    // console.log('Received startDate:', startDate, 'endDate:', endDate);

    let filter = {};

    if (startDate && endDate) {
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return response.status(400).json({ error: 'Invalid date format' });
      }

      const startOfDay = new Date(parsedStartDate);
      startOfDay.setUTCHours(0, 0, 0, 0); 

      const endOfDay = new Date(parsedEndDate);
      endOfDay.setUTCHours(23, 59, 59, 999); 

      filter = {
        date: {
          $gte: startOfDay.toISOString(),
          $lte: endOfDay.toISOString(),
          $exists: true,
        },
      };
    }

    // console.log('MongoDB filter:', filter);

    const assets = await Inventory.find(filter);

    response.json(assets);
  } catch (error) {
    systemLogger.error(error);
    return response.status(500).json({ error: error.message });
  }
};

export const fetchProductCves = async (request, response) => {
  console.log('Fetch Product',request.body);
  try {
    if (
      request.body !== undefined &&
      request.body.brand !== undefined &&
      request.body.osType !== undefined
    ) {
      let { firmwareVersion, partNo, osType, fromDate, toDate, brand ,serialNo } = request.body;

      if (firmwareVersion == null || firmwareVersion === "") {
        firmwareVersion = "-";
      } else {
        if (!firmwareVersion.includes(".")) {
          firmwareVersion = parseFloat(firmwareVersion).toFixed(1);
        }
      }
      let dateFilter = {};
      if (fromDate && toDate) {
        const parsedStartDate = new Date(fromDate);
        const parsedEndDate = new Date(toDate);
  
        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
          return response.status(400).json({ error: 'Invalid date format' });
        }
  
        const startOfDay = new Date(parsedStartDate);
        startOfDay.setUTCHours(0, 0, 0, 0); 
  
        const endOfDay = new Date(parsedEndDate);
        endOfDay.setUTCHours(23, 59, 59, 999); 
  
      
        if (fromDate && toDate) {
          dateFilter.date = {
            $gte: startOfDay.toISOString(),
            $lte: endOfDay.toISOString(),
          };
        }
      }


      // Build date range filter if fromDate and toDate are provided
      
     

      let cvesList;

      // Query database for CVEs, including serialNo
      cvesList = await vendorProductCveModel.find({
        osType: osType,
        partNo: partNo,
        version: firmwareVersion,
        vendorName:brand ,
        serialNo:serialNo,
        ...dateFilter,
      });

      if (cvesList.length == 0) {
        cvesList = await vendorProductCveModel.find({
          osType: osType,
          partNo: partNo,
          version: "-",
          vendorName:brand,
          serialNo:serialNo,
          ...dateFilter,
        });
      }

      if (cvesList.length == 0) {
        cvesList = await vendorProductCveModel.find({
          osType: osType,
          partNo: partNo,
          version: firmwareVersion,
          vendorName:brand,
          serialNo:serialNo,
          ...dateFilter,
        });

        if (cvesList.length == 0) {
          cvesList = await vendorProductCveModel.find({
            osType: osType,
            partNo: partNo,
            version: firmwareVersion,
            serialNo:serialNo,
            vendorName:brand,
            ...dateFilter,
          });
        }
      }

      // Filter for unique CVE IDs
      let result = cvesList.filter(
        (a, i) =>
          cvesList.findIndex(
            (s) => a.cveDetails.cve.id === s.cveDetails.cve.id
          ) === i
      );

      response.json(cvesList);
    }
  } catch (error) {
    systemLogger.error(error);
    console.log(error);
  }
};








export const deleteAssets = async (request, response) => {
  try {
    for (const asset of request.body) {
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
    systemLogger.error(`An error occurred while deleting the assets -  ${error}`)
    return response.status(500).json({
      success: false,
      message: "An error occurred while deleting the assets.",
    });
  }
};

export const uploadAssets = async (req, res, next) => {
  try {
    if (!req.file) {
      userActivityLogger.warn(`A warn occurred while uploading the assets - Please upload an excel file!`)
      return res.status(400).send("Please upload an excel file!");
    }

    const path = req.file.path;
    const fileName = req.file.filename;
    const substr = fileName.split("-")[2];
    const projectName = substr.split(".")[0];

    const rows = await readXlsxFile(path);
    if (rows.length === 0) {
      userLogger.warn(`A warn occurred while uploading the assets - The uploaded file is empty!`)
      return res.status(400).send("The uploaded file is empty!");
    }

    rows.shift(); // Remove the header row


    let totalCount = 0;
    let insertedCount = 0;
    const inventories = [];
    const currentDate = new Date().toISOString();
    const currentYear = new Date().getFullYear().toString(); // Get the current year as a string
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    for (const row of rows) {
      totalCount += 1;
      const inventory = {
        project:projectName,
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
        date: currentDate,
        year: currentYear,
        month: currentMonth,
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
    systemLogger.error(`An error occurred while uploading the assets - ${err}`)

    // logger.error(`Error uploading assets: ${err.message}`);
    return res.status(500).json({ success: false, message: err.message });
  }
};




// export const updateAsset = async (request, response) => {
//   try {
//     let status = request.body.status ? 'A' : 'I';

//     // Check if the asset already exists in the Inventory
//     const existingAsset = await Inventory.findOne({
//       project: request.body.project,
//       vendor: request.body.vendor,
//       partNo: request.body.partNo,
//       product: request.body.product,
//       type: request.body.type,
//       serialNo: request.body.serialNo,
//       firmwareVersion: request.body.firmwareVersion,
//       status: status,
//       osType: request.body.osType
//     });

//     // If the asset already exists and is not the current asset, return an error message
//     if (existingAsset && existingAsset._id.toString() !== request.body._id) {
//       return response.status(409).json({
//         success: false,
//         message: "Asset already exists with the same combination.",
//       });
//     }

//     // Update the vendor product records
//     const vendorFilter = {
//       vendorName: request.body.vendor,
//       osType: request.body.osType,
//       project: request.body.project,
//       partNo: request.body.partNo
//     };

//     const vendorProducts = await vendorProductCveModel.find(vendorFilter);
//     console.log('Found vendor products:', vendorProducts.length);

//     for (const product of vendorProducts) {
//       await vendorProductCveModel.findByIdAndUpdate(product._id, {
//         project: request.body.project,
//         vendor: request.body.vendor,
//         product: request.body.product,
//         partNo: request.body.partNo,
//         type: request.body.type,
//         serialNo: request.body.serialNo,
//         firmwareVersion: request.body.firmwareVersion,
//         status: status,
//         osType: request.body.osType
//       });
//     }

//     // Update the asset in Inventory
//     await Inventory.findByIdAndUpdate(request.body._id, {
//       project: request.body.project,
//       vendor: request.body.vendor,
//       product: request.body.product,
//       partNo: request.body.partNo,
//       type: request.body.type,
//       serialNo: request.body.serialNo,
//       firmwareVersion: request.body.firmwareVersion,
//       status: status,
//       osType: request.body.osType
//     });

//     return response.status(200).json({
//       success: true,
//       message: "Asset updated successfully",
//     });

//   } catch (error) {
//     console.error('Error updating asset:', error);
//     return response.status(500).json({
//       success: false,
//       message: "Error in updating Asset",
//     });
//   }
// }


export const updateAsset = async (request, response) => {
  // console.log("reup",request.body)
  try {
    let status = request.body.status ? 'A' : 'I';

    const existingAsset = await Inventory.findById(request.body._id);

    if (!existingAsset) {
      userActivityLogger.warn('Asset not found')
      return response.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    const duplicateAsset = await Inventory.findOne({
      project: request.body.project,
      vendor: request.body.vendor,
      partNo: request.body.partNo,
      product: request.body.product,
      type: request.body.type,
      serialNo: request.body.serialNo,
      firmwareVersion: request.body.firmwareVersion,
      status: status,
      osType: request.body.osType,
    });

    if (duplicateAsset && duplicateAsset._id.toString() !== request.body._id) {
      userActivityLogger.warn('Asset already exists with the same combination.')
      return response.status(409).json({
        success: false,
        message: "Asset already exists with the same combination.",
      });
    }
    const vendorFilter = {
      vendorName: existingAsset.vendor,
      osType: existingAsset.osType,
      project: existingAsset.project,
      partNo: existingAsset.partNo,
      type: existingAsset.type,
    };

    const vendorProducts = await vendorProductCveModel.find(vendorFilter);

    for (const product of vendorProducts) {
      await vendorProductCveModel.findByIdAndDelete(product._id)
      // try {
      //   const updatedProduct = await vendorProductCveModel.findByIdAndUpdate(
      //     product._id,
      //     {
      //       project: request.body.project,
      //       vendorName: request.body.vendor,
      //       productName: request.body.product,
      //       partNo: request.body.partNo,
      //       type: request.body.type,
      //       serialNo: request.body.serialNo,
      //       firmwareVersion: request.body.firmwareVersion,
      //       status: status,
      //       osType: request.body.osType
      //     },
      //     { new: true }
      //   );
    
      //   if (!updatedProduct) {
      //     userActivityLogger.warn(`Failed to update product`)
      //     console.log(`Failed to update product with _id: ${product._id}`);
      //   } else {
      //     console.log(`Updated product with _id: ${product._id}`);
      //     userActivityLogger.info(`Updated product with _id: ${product._id}`)

      //   }
      // } catch (error) {
      //   systemLogger.error(`Error updating product with _id: ${product._id}`, error)
      //   console.error(`Error updating product with _id: ${product._id}`, error);
      // }
    }
    

    // Update the asset in Inventory with the new values
    await Inventory.findByIdAndUpdate(request.body._id, {
      project: request.body.project,
      vendor: request.body.vendor,
      product: request.body.product,
      partNo: request.body.partNo,
      type: request.body.type,
      serialNo: request.body.serialNo,
      firmwareVersion: request.body.firmwareVersion,
      status: status,
      osType: request.body.osType,
    });
    userActivityLogger.info('Asset updated successfully')


    return response.status(200).json({
      success: true,
      message: "Asset updated successfully",
    });

  } catch (error) {
    systemLogger.error('Error updating asset -', error)
    console.error('Error updating asset:', error);
    return response.status(500).json({
      success: false,
      message: "Error in updating Asset",
    });
  }
}



export const createAsset = async (request, response) => {
  const currentDate = new Date().toISOString();
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  try {
    request.body.status = request.body.status ? 'A' : 'I';
    request.body.date = currentDate;
    request.body.month = currentMonth;
    request.body.year = currentYear;
    await Inventory.create(request.body);
    userActivityLogger.info('Asset created successfully')
    return response.status(200).json({
      success: true,
      message: "Asset created successfully",
    });

  } catch (error) {
    systemLogger.error('Error creating asset -', error)
    console.error('Error creating asset:', error);
    return response.status(500).json({
      success: false,
      message: "Error in creating Asset",
    });
  }

  // export const getAssets = async (request, response) => {
//   try {
//     const assets = await Inventory.find({}).sort({vendor:1})

//     response.json(assets);
//   } catch (error) {
//     return response.status(500).json({ error: error.message });
//   }
// };
}
