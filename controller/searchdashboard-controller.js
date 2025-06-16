import OemProducts from '../model/oemProductsSchema.js';
import Cve from '../model/cveSchema.js';
import OemList from '../model/oemListSchema.js';
import vendorProductCveModel from '../model/vendorProductCveSchema.js';
import Inventory from '../model/inventorySchema.js';
import { systemLogger,userActivityLogger } from '../helpers/loggers.js';


// export const searchCriteria = async (request, response) => {
//   try {
//     const {
//       vendorName,
//       cveId,
//       productName,
//       partNo,
//       project,
//       osType,
//       version,
//       firmwareVersion,
//       page = 1,
//       limit = request.body.pageSize,
//       exportAll = false
//     } = request.body;


//     const parsedLimit = exportAll ? 0 : parseInt(limit, 10);
//     // const parsedLimit = parseInt(limit, 10);
//     const options = {
//       page: parseInt(page, 10),
//       limit: parsedLimit,
//       sort: { cveId: -1 },
//     };

//     // Construct the initial match stage
//     const matchStage = {};
//     if (cveId && cveId.length > 0) matchStage.cveId = { $in: cveId };
//     if (vendorName && vendorName.length > 0)
//       matchStage.vendorName = { $in: vendorName };
//     if (productName && productName.length > 0)
//       matchStage.productName = { $in: productName };
//     if (partNo && partNo.length > 0) matchStage.partNo = { $in: partNo };
//     if (firmwareVersion && firmwareVersion.length > 0)
//       matchStage.firmwareVersion = { $in: firmwareVersion };
//     if (version && version.length > 0) matchStage.version = { $in: version };
//     if (project && project.length > 0) matchStage.project = { $in: project };
//     if (osType && osType.length > 0) matchStage.osType = { $in: osType };

//         // const aggregationQuery = [
//         //     { $match: matchStage },
//         //     { $sort: options.sort },
//         //     { $skip: (options.page - 1) * options.limit }, // Adjusted here
//         //     { $limit: options.limit },
//         const aggregationQuery = [
//           { $match: matchStage },
//           { $sort: options.sort },
//           ...(exportAll ? [] : [
//             { $skip: (options.page - 1) * options.limit },
//             { $limit: options.limit },
//           ]),
//             {
//                 $lookup: {
//                     from: "assets",
//                     localField: "partNo",
//                     foreignField: "partNo",
//                     as: "inventoryDetails"
//                 }
//             },
//             // {
//             //     $unwind: {
//             //         path: "$inventoryDetails",
//             //         preserveNullAndEmptyArrays: true
//             //     }
//             // },
//             {
//                 $project: {
//                     cveId: 1,
//                     vendorName: 1,
//                     productName: 1,
//                     partNo: 1,
//                     version: 1,
//                     firmwareVersion: 1,
//                     inventoryDetails: 1,
//                     project: 1,
//                     osType: 1,
//                      serialNo:1,
//                     seviarity:1,
//                 }
//             }
//         ];

//     const results = await vendorProductCveModel.aggregate(aggregationQuery);

//     // Response object preparation
//     const total = await vendorProductCveModel.countDocuments(matchStage);
//     // const totalPages = Math.ceil(total / parsedLimit);
//     const totalPages = exportAll ? 1 : Math.ceil(total / parsedLimit);

//     response.json({
//       docs: results,
//       total,
//       totalPages,
//       page: options.page,
//     });
//   } catch (error) {
//     console.error(error);
//     response.status(500).json({ error: error.message });
//   }
// };

export const searchCriteria = async (request, response) => {
// console.log("mmmm",request.body)
  try {
    const {
      vendorName,
      cveId,
      productName,
      partNo,
      project,
      osType,
      version,
      firmwareVersion,
      page = 1,
      limit = request.body.pageSize,
      startDate,  
      endDate
    } = request.body;

    const parsedLimit = parseInt(limit, 10);
    const options = {
      page: parseInt(page, 10),
      limit: parsedLimit,
      sort: { cveId: -1 },
    };

    // Construct the initial match stage
    const matchStage = {};
    if (cveId && cveId.length > 0) matchStage.cveId = { $in: cveId };
    if (vendorName && vendorName.length > 0)
      matchStage.vendorName = { $in: vendorName };
    if (productName && productName.length > 0)
      matchStage.productName = { $in: productName };
    if (partNo && partNo.length > 0) matchStage.partNo = { $in: partNo };
    if (firmwareVersion && firmwareVersion.length > 0)
      matchStage.firmwareVersion = { $in: firmwareVersion };
    if (version && version.length > 0) matchStage.version = { $in: version };
    if (project && project.length > 0) matchStage.project = { $in: project };
    if (osType && osType.length > 0) matchStage.osType = { $in: osType };

    if (startDate && endDate) {
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);
      
      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
          return response.status(400).json({ error: 'Invalid date format' });
      }
      const startDateIST = new Date(parsedStartDate);
      startDateIST.setHours(0, 0, 0, 0); 
      startDateIST.setMinutes(startDateIST.getMinutes() - startDateIST.getTimezoneOffset() + 330); 
      
      const endDateIST = new Date(parsedEndDate);
      endDateIST.setHours(23, 59, 59, 999); 
      endDateIST.setMinutes(endDateIST.getMinutes() - endDateIST.getTimezoneOffset() + 330); 
      const startDateStr = startDateIST.toISOString();
      const endDateStr = endDateIST.toISOString();

      // const startOfDay = new Date(parsedStartDate.setUTCHours(0, 0, 0, 0));
      // const endOfDay = new Date(parsedEndDate.setUTCHours(23, 59, 59, 999));
      // console.log("sss",startDateStr)
      // console.log('ccc',endDateStr)
    const startYear = startDateIST.getFullYear();
    const startMonth = startDateIST.getMonth();
    const startDay = startDateIST.getDate();

    const endYear = endDateIST.getFullYear();
    const endMonth = endDateIST.getMonth();
    const endDay = endDateIST.getDate();

    const isExactOneMonth =
        (endYear === startYear && endMonth === startMonth + 1 ) ||
        (endYear === startYear + 1 && startMonth === 11 && endMonth === 0);
    // console.log("isExactOneMonth",isExactOneMonth)

    if (!isExactOneMonth) {
        matchStage.date = { $gte: startDateStr, $lte: endDateStr };
    }

      // matchStage.date = { $gte: startDateStr, $lte: endDateStr };
  }
        const aggregationQuery = [
            { $match: matchStage },
            { $sort: options.sort },
            { $skip: (options.page - 1) * options.limit }, 
            { $limit: options.limit },
      
            {
                $lookup: {
                    from: "assets",
                    localField: "partNo",
                    foreignField: "partNo",
                    as: "inventoryDetails"
                }
            },
            // {
            //     $unwind: {
            //         path: "$inventoryDetails",
            //         preserveNullAndEmptyArrays: true
            //     }
            // },
            {
                $project: {
                    cveId: 1,
                    vendorName: 1,
                    productName: 1,
                    partNo: 1,
                    version: 1,
                    firmwareVersion: 1,
                    inventoryDetails: 1,
                    project: 1,
                    osType: 1,
                     serialNo:1,
                    seviarity:1,
                    advisoryTitle:1,
                    vulnerableComponent:1,
                    vulnerableFeature:1,
                    workarounds:1,
                    fixedRelease:1,
                    impactRate:1,
                    cvssScore:1,
                    advisoryUrl:1

                }
            }
        ];

    const results = await vendorProductCveModel.aggregate(aggregationQuery);

    // Response object preparation
    const total = await vendorProductCveModel.countDocuments(matchStage);
    const totalPages = Math.ceil(total / parsedLimit);
    // const totalPages = exportAll ? 1 : Math.ceil(total / parsedLimit);

    response.json({
      docs: results,
      total,
      totalPages,
      page: options.page,
    });
  } catch (error) {
    console.error(error);
    systemLogger.error(error)
    response.status(500).json({ error: error.message });
  }
};

   

export const getOemVendorList = async (request, response) => {
    try {
        const oemList = await OemList.find().sort({ oemName: 1 });
        response.json(oemList);
    } catch (error) {
      systemLogger.error(error)
        return response.status(500).json(error.message);
    }
};

export const getProductsByVendor = async (request, response) => {
    try {
        const vendorNameList = request.body.vendorName;
        const allProducts = [];

        for (const vendor of vendorNameList) {
            const productsList = await vendorProductCveModel.find({ "vendorName": vendor }, "productName").sort({ productName: 1 });
            allProducts.push(...productsList.map(product => product.productName));
        }

        response.json(allProducts);
    } catch (error) {
      systemLogger.error(error)
        return response.status(500).json(error.message);
    }
};

export const getCveDetails = async (request, response) => {
  try {
    console.log("getCveDetails", request.body.cveId);

    const { cveId } = request.body;
    if (!cveId) {
      return response.status(400).json({ error: "cveId is required" });
    }

    let cveData = await vendorProductCveModel.distinct("cveDetails", { cveId });

    if (!cveData.length) {
      cveData = await Cve.distinct("cveDetails", { cveId });
    }

    if (!cveData.length) {
      return response.status(404).json({ message: "CVE not found" });
    }

    return response.json(cveData);
  } catch (error) {
    console.error("Error fetching CVE details:", error);
    systemLogger.error(error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSearchCveDetails = async (request, response) => {

    try {
        const cveId = request.body.cveId;
        const cveData = await vendorProductCveModel.distinct("cveDetails", { "cveId": cveId });
        response.json(cveData);
    } catch (error) {
      systemLogger.error(error)
        return response.status(500).json(error.message);
    }
  };