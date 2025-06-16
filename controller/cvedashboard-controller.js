import Cve from '../model/cveSchema.js';
import vendorProductCveModel from '../model/vendorProductCveSchema.js';
import InventoryModel from '../model/inventorySchema.js';
import logCve from '../model/logsSchema.js';
import { systemLogger,userActivityLogger } from '../helpers/loggers.js';
import Inventory from '../model/inventorySchema.js';
import oemList from '../model/oemListSchema.js';
export const getCvesByDateRange = async (request, response) => {

  try {
    let cves = "";
    let model = "";

    if (request.body.allData) {
      model = Cve;
    } else {
      model = vendorProductCveModel;
    }

    if (request.body.fromDate == "" && request.body.toDate == "") {

      var dateTime = new Date();
      let date = ("0" + dateTime.getDate()).slice(-2);
      var month = dateTime.getMonth() + 1;
      month = ("0" + month).slice(-2);
      var year = dateTime.getFullYear();
      dateTime.setMonth(dateTime.getMonth() - request.body.duration);
      var oldMonth = dateTime.getMonth() + 1;
      oldMonth = ("0" + oldMonth).slice(-2);
      let oldDate = ("0" + dateTime.getDate()).slice(-2);
      var oldYear = dateTime.getFullYear();

      cves = await model.find({
        date: { $gte: oldYear + "-" + oldMonth + "-" + oldDate, $lte: year + "-" + month + "-" + date }
      })

    } else {

      cves = await model.find({
        date: { $gte: request.body.fromDate, $lte: request.body.toDate }

      })

    }

    let key = 'cveId';
    const uniqueCveList = [...new Map(cves.map(item =>
      [item[key], item])).values()];


    response.json(uniqueCveList);
  } catch (error) {
    systemLogger.error(error)
    console.log("error is" + error);
  }
};



// export const getOemCvesByDateRange = async (request, response) => {

//     try {
//         let cves ="";

//         if(request.body.fromDate == "" && request.body.toDate == ""){

//             var dateTime = new Date();
//             let date = ("0" + dateTime.getDate()).slice(-2);
//             var month = dateTime.getMonth() + 1;
//             month = ("0" + month).slice(-2);
//             var year = dateTime.getFullYear();
//             dateTime.setMonth(dateTime.getMonth() - request.body.duration);
//               var oldMonth = dateTime.getMonth() + 1;
//               oldMonth = ("0" + oldMonth).slice(-2);
//               let oldDate = ("0" + dateTime.getDate()).slice(-2);
//               var oldYear = dateTime.getFullYear();

//               cves =   await  vendorProductCveModel.find({ 
//                 date: { $gte: oldYear+"-"+oldMonth+"-"+oldDate, $lte: year+"-"+month+"-"+date } 
//             })

//         }else{

//             cves =   await  vendorProductCveModel.find({ 
//                 date: { $gte: request.body.fromDate, $lte: request.body.toDate } 

//             })

//         }
//            response.json(cves);
//     } catch (error) {
//     console.log("error is" + error);
//     }
// };

export const getCvesCountByDateRange = async (request, response) => {

  try {


    // let totalCount = 0;
    // let criticalCount = 0;
    // let highCount = 0;
    // let mediumCount = 0;
    // let lowCount = 0;
    let model = "";

    if (request.body.allData) {
      model = Cve;
    } else {
      model = vendorProductCveModel;
    }

    if (request.body.fromDate == "" && request.body.toDate == "") {

      var dateTime = new Date();
      let date = ("0" + dateTime.getDate()).slice(-2);
      var month = dateTime.getMonth() + 1;
      month = ("0" + month).slice(-2);
      var year = dateTime.getFullYear();
      dateTime.setMonth(dateTime.getMonth() - request.body.duration);
      var oldMonth = dateTime.getMonth() + 1;
      oldMonth = ("0" + oldMonth).slice(-2);
      let oldDate = ("0" + dateTime.getDate()).slice(-2);
      var oldYear = dateTime.getFullYear();

      totalCount = await model.distinct("cveId", {
        date: { $gte: oldYear + "-" + oldMonth + "-" + oldDate, $lte: year + "-" + month + "-" + date }
      });

      let criticalCount = await model.distinct("cveId", { "seviarity": "CRITICAL" }, {
        date: { $gte: oldYear + "-" + oldMonth + "-" + oldDate, $lte: year + "-" + month + "-" + date }
      });
      let highCount = await model.distinct("cveId", { "seviarity": "HIGH" }, {
        date: { $gte: oldYear + "-" + oldMonth + "-" + oldDate, $lte: year + "-" + month + "-" + date }
      });
      let mediumCount = await model.distinct("cveId", { "seviarity": "MEDIUM" }, {
        date: { $gte: oldYear + "-" + oldMonth + "-" + oldDate, $lte: year + "-" + month + "-" + date }
      });
      let lowCount = await model.distinct("cveId", { "seviarity": "LOW" }, {
        date: { $gte: oldYear + "-" + oldMonth + "-" + oldDate, $lte: year + "-" + month + "-" + date }
      });


      let cveCount = { "totalCount": totalCount.length, "criticalCount": criticalCount.length, "highCount": highCount.length, "mediumCount": mediumCount.length, "lowCount": lowCount.length }
      response.json(cveCount);
    } else {


      totalCount = await model.find({
        date: { $gte: request.body.fromDate, $lte: request.body.toDate }
      }).count();
      criticalCount = await model.find({ "seviarity": "CRITICAL" }, {
        date: { $gte: request.body.fromDate, $lte: request.body.toDate }
      }).count();
      highCount = await model.find({ "seviarity": "HIGH" }, {
        date: { $gte: request.body.fromDate, $lte: request.body.toDate }
      }).count();
      mediumCount = await model.find({ "seviarity": "MEDIUM" }, {
        date: { $gte: request.body.fromDate, $lte: request.body.toDate }
      }).count();
      lowCount = await model.find({ "seviarity": "LOW" }, {
        date: { $gte: request.body.fromDate, $lte: request.body.toDate }
      }).count();
      let cveCount = { "totalCount": totalCount.length, "criticalCount": criticalCount.length, "highCount": highCount.length, "mediumCount": mediumCount.length, "lowCount": lowCount.length }
      response.json(cveCount);
    }



  } catch (error) {
    systemLogger.error(error)
    console.log("error is" + error);
  }
};


export const getCveDataBySeviarity = async (request, response) => {
  console.log("getservrity", request)

  try {
    let cves = "";
    let model = "";
    if (request.body.allData) {
      model = Cve;
    } else {
      model = vendorProductCveModel;
    }

    if (request.body.fromDate == "" && request.body.toDate == "") {

      var dateTime = new Date();
      let date = ("0" + dateTime.getDate()).slice(-2);
      var month = dateTime.getMonth() + 1;
      month = ("0" + month).slice(-2);
      var year = dateTime.getFullYear();
      dateTime.setMonth(dateTime.getMonth() - request.body.duration);
      var oldMonth = dateTime.getMonth() + 1;
      oldMonth = ("0" + oldMonth).slice(-2);
      let oldDate = ("0" + dateTime.getDate()).slice(-2);
      var oldYear = dateTime.getFullYear();

      if (request.body.seviarity == "") {
        cves = await model.find({
          date: { $gte: oldYear + "-" + oldMonth + "-" + oldDate, $lte: year + "-" + month + "-" + date }
        })
      } else {

        cves = await model.find({
          $and: [{ seviarity: { $eq: request.body.seviarity } },
          { date: { $gte: oldYear + "-" + oldMonth + "-" + oldDate, $lte: year + "-" + month + "-" + date } }]

        })
      }

    } else {
      if (request.body.seviarity == "") {
        console.log("&&&&&calling else");
        cves = await model.find({
          date: { $gte: request.body.fromDate, $lte: request.body.toDate }

        })
      } else {
        cves = await model.find({
          $and: [{ seviarity: { $eq: request.body.seviarity } },
          { date: { $gte: request.body.fromDate, $lte: request.body.toDate } }]

        })
      }
    }

    // let key = 'cveId';
    // const uniqueCveList = [...new Map(cves.map(item =>
    //   [item[key], item])).values()];

    response.json(cves);
  } catch (error) {
    systemLogger.error(error)
    console.log("error is" + error);
  }
};

export const getCveDataByBrand = async (request, response) => {
   console.log("Received request:", request.body);

  try {
    let cves = "";
    let model = "";
    if (request.body.allData) {
      model = Cve;
    } else {
      model = vendorProductCveModel;
    }

    const { fromDate, toDate, duration, vendorName } = request.body;
    console.log(`Querying for vendor: ${vendorName}`);

    if (fromDate == "" && toDate == "") {
      var dateTime = new Date();
      let date = ("0" + dateTime.getDate()).slice(-2);
      var month = dateTime.getMonth() + 1;
      month = ("0" + month).slice(-2);
      var year = dateTime.getFullYear();
      dateTime.setMonth(dateTime.getMonth() - duration);
      var oldMonth = dateTime.getMonth() + 1;
      oldMonth = ("0" + oldMonth).slice(-2);
      let oldDate = ("0" + dateTime.getDate()).slice(-2);
      var oldYear = dateTime.getFullYear();

      if (vendorName == "") {
        cves = await model.find({
          date: { $gte: oldYear + "-" + oldMonth + "-" + oldDate, $lte: year + "-" + month + "-" + date }
        });
      } else {
        cves = await model.find({
          $and: [{ vendorName: { $eq: vendorName } },
          { date: { $gte: oldYear + "-" + oldMonth + "-" + oldDate, $lte: year + "-" + month + "-" + date } }]
        });
      }

    } else {
      if (vendorName == "") {
        console.log("Querying without vendor name");
        cves = await model.find({
          date: { $gte: fromDate, $lte: toDate }
        });
      } else {
        cves = await model.find({
          $and: [{ vendorName: { $eq: vendorName } },
          { date: { $gte: fromDate, $lte: toDate } }]
        });
      }
    }

    console.log(`Found ${cves.length} records for vendor: ${vendorName}`);
    console.log("Fetched CVE records:", cves);

    // Here we directly use the records as they are because we found all have the same `cveId`.
    // If the data is expected to be unique, but isn't, you should investigate the source of the data.
    
    response.json(cves);
  } catch (error) {
    console.log("error is" + error);
    systemLogger.error(error)
    response.status(500).send("Internal Server Error");
  }
};

export const getCveDataByAsset = async (request, response) => {

 try {
   let cves = "";
   let model = "";
   if (request.body.allData) {
     model = Cve;
   } else {
     model = vendorProductCveModel;
   }

   const { fromDate, toDate, duration, type } = request.body;

   if (fromDate == "" && toDate == "") {
     var dateTime = new Date();
     let date = ("0" + dateTime.getDate()).slice(-2);
     var month = dateTime.getMonth() + 1;
     month = ("0" + month).slice(-2);
     var year = dateTime.getFullYear();
     dateTime.setMonth(dateTime.getMonth() - duration);
     var oldMonth = dateTime.getMonth() + 1;
     oldMonth = ("0" + oldMonth).slice(-2);
     let oldDate = ("0" + dateTime.getDate()).slice(-2);
     var oldYear = dateTime.getFullYear();

     if (type == "") {
       cves = await model.find({
         date: { $gte: oldYear + "-" + oldMonth + "-" + oldDate, $lte: year + "-" + month + "-" + date }
       });
     } else {
       cves = await model.find({
         $and: [{ type: { $eq: type } },
         { date: { $gte: oldYear + "-" + oldMonth + "-" + oldDate, $lte: year + "-" + month + "-" + date } }]
       });
     }

   } else {
     if (type == "") {
       cves = await model.find({
         date: { $gte: fromDate, $lte: toDate }
       });
     } else {
       cves = await model.find({
         $and: [{ type: { $eq: type } },
         { date: { $gte: fromDate, $lte: toDate } }]
       });
     }
   }

   response.json(cves);
 } catch (error) {
   console.log("error is" + error);
   systemLogger.error(error)
   response.status(500).send("Internal Server Error");
 }
};

export const getCveDataCountByProject = async (request, response) => {

  try {
    let model = "";
    if (request.body.allData) {
      model = Cve;
    } else {
      model = vendorProductCveModel;
    }

    const { fromDate, toDate, duration, project } = request.body;
    
    let query = {};
    if (fromDate === "" && toDate === "") {
      let dateTime = new Date();
      let date = ("0" + dateTime.getDate()).slice(-2);
      let month = ("0" + (dateTime.getMonth() + 1)).slice(-2);
      let year = dateTime.getFullYear();
      dateTime.setMonth(dateTime.getMonth() - duration);
      let oldDate = ("0" + dateTime.getDate()).slice(-2);
      let oldMonth = ("0" + (dateTime.getMonth() + 1)).slice(-2);
      let oldYear = dateTime.getFullYear();

      query.date = {
        $gte: `${oldYear}-${oldMonth}-${oldDate}`,
        $lte: `${year}-${month}-${date}`,
      };
    } else {
      query.date = { $gte: fromDate, $lte: toDate };
    }

    if (project) {
      query.project = project;
    }

    const severityCounts = await model.aggregate([
      { 
        $match: { 
          ...query,
          seviarity: { $ne: null }, 
        },
      },
      {
        $group: {
          _id: "$seviarity", 
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          seviarity: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    const result = severityCounts.reduce((acc, { seviarity, count }) => {
      acc[seviarity] = count;
      return acc;
    }, {});

    response.json(result);
  } catch (error) {
    response.status(500).send("Internal Server Error");
  }
};


export const getCveDataByProject = async (request, response) => {

  try {
    let cves = "";
    let model = "";
    if (request.body.allData) {
      model = Cve;
    } else {
      model = vendorProductCveModel;
    }

    const { fromDate, toDate, duration, project } = request.body; // Corrected `project` spelling
   

    if (fromDate == "" && toDate == "") {
      var dateTime = new Date();
      let date = ("0" + dateTime.getDate()).slice(-2);
      var month = dateTime.getMonth() + 1;
      month = ("0" + month).slice(-2);
      var year = dateTime.getFullYear();
      dateTime.setMonth(dateTime.getMonth() - duration);
      var oldMonth = dateTime.getMonth() + 1;
      oldMonth = ("0" + oldMonth).slice(-2);
      let oldDate = ("0" + dateTime.getDate()).slice(-2);
      var oldYear = dateTime.getFullYear();

      if (project == "") {
        cves = await model.find({
          date: { $gte: oldYear + "-" + oldMonth + "-" + oldDate, $lte: year + "-" + month + "-" + date }
        });
      } else {
        cves = await model.find({
          $and: [{ project: { $eq: project } }, // Corrected `poject` to `project`
          { date: { $gte: oldYear + "-" + oldMonth + "-" + oldDate, $lte: year + "-" + month + "-" + date } }]
        });
      }

    } else {
      if (project == "") {
        cves = await model.find({
          date: { $gte: fromDate, $lte: toDate }
        });
      } else {
        cves = await model.find({
          $and: [{ project: { $eq: project } }, // Corrected `poject` to `project`
          { date: { $gte: fromDate, $lte: toDate } }]
        });
      }
    }
    
    response.json(cves);
  } catch (error) {
    systemLogger.error(error)
    response.status(500).send("Internal Server Error");
  }
};

export const getAllVendors = async (request, response) => {
  try {
    // Fetch all distinct oemNames from the oemList collection
    const oemNames = await oemList.distinct('oemName');

    // Return the list of oemNames in the response
    response.status(200).json({
      success: true,
      data: oemNames
    });
  } catch (error) {
    // Log the error and send an error response
    systemLogger.error(error);
    console.error("Error occurred while fetching oemNames:", error);
    response.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
};



export const getCircularDashboardData = async (request, response) => {
  try {
    const { allData, fromDate, toDate, duration } = request.body;
    let model = allData ? Cve : vendorProductCveModel;

    const getDateRangeQuery = () => {
      if (fromDate === "" && toDate === "") {
        const dateTime = new Date();
        const year = dateTime.getFullYear();
        const month = ("0" + (dateTime.getMonth() + 1)).slice(-2);
        const date = ("0" + dateTime.getDate()).slice(-2);
    
        // Adjust date for duration (subtract months)
        dateTime.setMonth(dateTime.getMonth() - duration);
        const oldYear = dateTime.getFullYear();
        const oldMonth = ("0" + (dateTime.getMonth() + 1)).slice(-2);
        const oldDate = ("0" + dateTime.getDate()).slice(-2);
    
        return {
          date: {
            $gte: `${oldYear}-${oldMonth}-${oldDate}T00:00:00.000Z`, // Start of day
            $lte: `${year}-${month}-${date}T23:59:59.999Z`  // End of day
          }
        };
      } else {
        return {
          date: {
            $gte: `${fromDate}T00:00:00.000Z`, 
            $lte: `${toDate}T23:59:59.999Z`
          }
        };
      }
    };
    

    const getDistinctCount = async (query) => {
      const count = await model.countDocuments(query);
      return count;
    };

    const [totalCount, criticalCount, highCount, mediumCount, lowCount] = await Promise.all([
      getDistinctCount(getDateRangeQuery()),
      getDistinctCount({ ...getDateRangeQuery(), seviarity: "CRITICAL" }),
      getDistinctCount({ ...getDateRangeQuery(), seviarity: "HIGH" }),
      getDistinctCount({ ...getDateRangeQuery(), seviarity: "MEDIUM" }),
      getDistinctCount({ ...getDateRangeQuery(), seviarity: "LOW" }),
    ]);

    const getVendorCount = async (field) => {
      const vendorList = await model.aggregate([
        { $match: getDateRangeQuery() },
        {
          $group: {
            _id: { $trim: { input: `$${field}` } },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            [field]: '$_id',
            count: 1
          }
        }
      ]);
      return vendorList;
    };
    const getAssetsByBrandCount = async (field) => {
      model = Inventory
      const vendorList = await model.aggregate([
        { $match: getDateRangeQuery() },
        {
          $group: {
            _id: { $trim: { input: `$${field}` } },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            [field]: '$_id',
            count: 1
          }
        }
      ]);
      return vendorList;
    };
    const getAssetByTypeCount = async (field) => {
      model = Inventory
      const vendorList = await model.aggregate([
        { $match: getDateRangeQuery() },
        {
          $group: {
            _id: { $trim: { input: `$${field}` } },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            [field]: '$_id',
            count: 1
          }
        }
      ]);
      return vendorList;
    };
    const getVendors = async (field) => {
      const model = vendorProductCveModel;
      const vendorList = await model.aggregate([
        { $match: getDateRangeQuery() }, // Filter by date range
        {
          $group: {
            _id: { $trim: { input: `$${field}` } } // Trim whitespace and group by vendor name
          }
        },
        {
          $project: {
            _id: 0, 
            [field]: '$_id'  // Rename _id to vendor field
          }
        }
      ]);
    
      return vendorList;
    };
    
    // const getVendors = async (field) => {
    //   model = Inventory;
    //   const vendorList = await model.aggregate([
    //     { $match: getDateRangeQuery() },
    //     {
    //       $group: {
    //         _id: { $trim: { input: `$${field}` } }, 
    //         count: { $sum: 1 } 
    //       }
    //     },
    //     {
    //       $project: {
    //         _id: 0, 
    //         [field]: '$_id', 
    //         count: 1 
    //       }
    //     }
    //   ]);
    
    //   return vendorList;
    // };
    
    const [vendorsListCount, assetTypesCount, projectCount,assetByBrandCount,assetByTypeCount,venderCount] = await Promise.all([
      getVendorCount("vendorName"),
      getVendorCount("type"),
      getVendorCount("project"),
      getAssetsByBrandCount("vendor"),
      getAssetByTypeCount("type"),
      getVendors("vendorName")

    ]);

    const circularDashboardData = {
      byCriticality: { totalCount, criticalCount, highCount, mediumCount, lowCount },
      byBrands: vendorsListCount,
      byAssetTypes: assetTypesCount,
      byContractId: projectCount,
      assetsByBrand:assetByBrandCount,
      assetsByType:assetByTypeCount,
      byVendors:venderCount,
    };

    response.json(circularDashboardData);
  } catch (error) {
    systemLogger.error(error)
    console.error("Error occurred:", error);
    response.status(500).json({ error: "Internal Server Error" });
  }
};




// export const getCircularDashboardData = async (request, response) => {
//   try {
//     const { allData, fromDate, toDate, duration } = request.body;
//     const model = allData ? Cve : vendorProductCveModel;

//     const getDateRangeQuery = () => {
//       if (fromDate === "" && toDate === "") {
//         const dateTime = new Date();
//         const year = dateTime.getFullYear();
//         const month = ("0" + (dateTime.getMonth() + 1)).slice(-2);
//         const date = ("0" + dateTime.getDate()).slice(-2);

//         dateTime.setMonth(dateTime.getMonth() - duration);

//         const oldYear = dateTime.getFullYear();
//         const oldMonth = ("0" + (dateTime.getMonth() + 1)).slice(-2);
//         const oldDate = ("0" + dateTime.getDate()).slice(-2);

//         return {
//           date: { $gte: `${oldYear}-${oldMonth}-${oldDate}`, $lte: `${year}-${month}-${date}` }
//         };
//       } else {
//         return {
//           date: { $gte: fromDate, $lte: toDate }
//         };
//       }
//     };

//     const getDistinctCount = async (query) => {
//       const count = await model.countDocuments(query);
//       return count;
//     };

//     const [totalCount, criticalCount, highCount, mediumCount, lowCount] = await Promise.all([
//       getDistinctCount(getDateRangeQuery()),
//       getDistinctCount({ ...getDateRangeQuery(), seviarity: "CRITICAL" }),
//       getDistinctCount({ ...getDateRangeQuery(), seviarity: "HIGH" }),
//       getDistinctCount({ ...getDateRangeQuery(), seviarity: "MEDIUM" }),
//       getDistinctCount({ ...getDateRangeQuery(), seviarity: "LOW" }),
//     ]);

//     const getVendorCount = async (field) => {
//       try{
// // if(field === "vendorName" || field === "type" || field === "project") {
//   const brands = await model.distinct(field);
//   const vendorList = await Promise.all(brands.map(async (brand) => {
//     const cveCnts = await model.aggregate([
//       { $match: { [field]: brand, ...getDateRangeQuery() } },
//     ]);
//     return { [field]: brand, count: cveCnts.length > 0 ? cveCnts[0].count : 0 };
//   }));
//   return vendorList;
// // }else {
// //   const brands = await InventoryModel.distinct(field);
// //   const vendorList = await Promise.all(brands.map(async (brand) => {
// //     const cveCnts = await InventoryModel.aggregate([
// //       { $match: { [field]: brand} },
// //       { $group: { _id: null, count: { $sum: "$vulnarabilities" } } }
// //     ]);
// //     return { vendorName: brand, count: cveCnts.length > 0 ? cveCnts[0].count : 0 };
// //   }));
// //   return vendorList;
// // }
//       } catch(err){
//         console.log(err);
//         // return [];
//       }
      
//     };
//     const [vendorsListCount, assetTypesCount, projectCount] = await Promise.all([
//       getVendorCount("vendorName"),
//       getVendorCount("osType"),
//       getVendorCount("project"),
//     ]);

//     const circularDashboardData = {
//       byCriticality: { totalCount, criticalCount, highCount, mediumCount, lowCount },
//       byBrands: vendorsListCount,
//       byAssetTypes: assetTypesCount,
//       byContractId: projectCount,
//     };

//     response.json(circularDashboardData);
//   } catch (error) {
//     console.error("Error occurred:", error);
//     response.status(500).json({ error: "Internal Server Error" });
//   }
// };




// export const getVulnarabilityTrendData = async (request, response) => {
//   try {
//     const model = request.body.allData ? Cve : vendorProductCveModel;
//     const year = request.body.year;
//     const months = Array.from({ length: 12 }, (_, i) => i + 1); // Array from 1 to 12

//     const getCountsForSeverity = async (severity, month) => {
//       const count = await model.distinct("cveId", { "seviarity": severity, "month": month, "year": year });
//       return count.length;
//     };

//     const cveListCount = await Promise.all(months.map(async (month) => {
//       const [criticalCount, highCount, mediumCount, lowCount] = await Promise.all([
//         getCountsForSeverity("CRITICAL", month),
//         getCountsForSeverity("HIGH", month),
//         getCountsForSeverity("MEDIUM", month),
//         getCountsForSeverity("LOW", month)
//       ]);

//       return {
//         "month": month,
//         "year": year,
//         "criticalCount": criticalCount,
//         "highCount": highCount,
//         "mediumCount": mediumCount,
//         "lowCount": lowCount
//       };
//     }));

//     response.json(cveListCount);
//   } catch (error) {
//     console.error("Error occurred:", error);
//     response.status(500).json({ error: "Internal Server Error" });
//   }
// };



export const getVulnarabilityTrendData = async (request, response) => {
  try {
    const model = request.body.allData ? Cve : vendorProductCveModel;
    const { startDate, endDate } = request.body;

    // Function to get counts for a specific severity within a date range
    const getCountsForSeverity = async (severity, start, end) => {
      console.log(`Querying for severity ${severity} between ${start} and ${end}`);
      const count = await model.countDocuments({
        "seviarity": severity,
        "date": { $gte: start, $lte: end }
      });
      console.log(`Count for severity ${severity}: ${count}`);
      return count;
    };

    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = [];

    // Generate month-year pairs between the start and end dates
    let current = start;
    while (current <= end) {
      months.push({ year: current.getFullYear(), month: current.getMonth() + 1 });
      current.setMonth(current.getMonth() + 1);
    }

    const cveListCount = await Promise.all(months.map(async ({ year, month }) => {
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);

      // Convert Date objects to strings in the format you use in your database
      const monthStartString = monthStart.toISOString().split('T')[0];
      const monthEndString = monthEnd.toISOString().split('T')[0];

      console.log(`Processing month: ${month}, year: ${year}`);
      const [criticalCount, highCount, mediumCount, lowCount] = await Promise.all([
        getCountsForSeverity("CRITICAL", monthStartString, monthEndString),
        getCountsForSeverity("HIGH", monthStartString, monthEndString),
        getCountsForSeverity("MEDIUM", monthStartString, monthEndString),
        getCountsForSeverity("LOW", monthStartString, monthEndString)
      ]);

      return {
        "month": month,
        "year": year,
        "criticalCount": criticalCount,
        "highCount": highCount,
        "mediumCount": mediumCount,
        "lowCount": lowCount
      };
    }));

    response.json(cveListCount);
  } catch (error) {
    systemLogger.error(error)
    console.error("Error occurred:", error);
    response.status(500).json({ error: "Internal Server Error" });
  }
};




export const getDailyLogs = async (request, response) => {

  try {
  

    let cves = await logCve.find({
        date: { $eq: request.body.todayDate }

      })

    let key = 'cveId';
    const uniqueCveList = [...new Map(cves.map(item =>
      [item[key], item])).values()];

    response.json(uniqueCveList);
  } catch (error) {
    systemLogger.error(error)
    console.log("error is" + error);
  }
};
    