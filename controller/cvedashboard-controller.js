import Cve from '../model/cveSchema.js';
import vendorProductCveModel from '../model/vendorProductCveSchema.js';
import InventoryModel from '../model/inventorySchema.js';
import logCve from '../model/logsSchema.js';

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
    console.log("error is" + error);
  }
};


export const getCveDataBySeviarity = async (request, response) => {

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

    let key = 'cveId';
    const uniqueCveList = [...new Map(cves.map(item =>
      [item[key], item])).values()];


    response.json(uniqueCveList);
  } catch (error) {
    console.log("error is" + error);
  }
};



export const getCircularDashboardData = async (request, response) => {
  try {
    const { allData, fromDate, toDate, duration } = request.body;
    const model = allData ? Cve : vendorProductCveModel;

    const getDateRangeQuery = () => {
      if (fromDate === "" && toDate === "") {
        const dateTime = new Date();
        const year = dateTime.getFullYear();
        const month = ("0" + (dateTime.getMonth() + 1)).slice(-2);
        const date = ("0" + dateTime.getDate()).slice(-2);

        dateTime.setMonth(dateTime.getMonth() - duration);

        const oldYear = dateTime.getFullYear();
        const oldMonth = ("0" + (dateTime.getMonth() + 1)).slice(-2);
        const oldDate = ("0" + dateTime.getDate()).slice(-2);

        return {
          date: { $gte: `${oldYear}-${oldMonth}-${oldDate}`, $lte: `${year}-${month}-${date}` }
        };
      } else {
        return {
          date: { $gte: fromDate, $lte: toDate }
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
      const brands = await InventoryModel.distinct(field);
      const vendorList = await Promise.all(brands.map(async (brand) => {
        const cveCnts = await InventoryModel.aggregate([
          { $match: { [field]: brand } },
          { $group: { _id: null, count: { $sum: "$vulnarabilities" } } }
        ]);
        return { vendorName: brand, count: cveCnts.length > 0 ? cveCnts[0].count : 0 };
      }));
      return vendorList;
    };
    const [vendorsListCount, assetTypesCount, projectCount] = await Promise.all([
      getVendorCount("vendor"),
      getVendorCount("type"),
      getVendorCount("project"),
    ]);

    const circularDashboardData = {
      byCriticality: { totalCount, criticalCount, highCount, mediumCount, lowCount },
      byBrands: vendorsListCount,
      byAssetTypes: assetTypesCount,
      byContractId: projectCount,
    };

    response.json(circularDashboardData);
  } catch (error) {
    console.error("Error occurred:", error);
    response.status(500).json({ error: "Internal Server Error" });
  }
};




export const getVulnarabilityTrendData = async (request, response) => {
  try {
    const model = request.body.allData ? Cve : vendorProductCveModel;
    const year = request.body.year;
    const months = Array.from({ length: 12 }, (_, i) => i + 1); // Array from 1 to 12

    const getCountsForSeverity = async (severity, month) => {
      const count = await model.distinct("cveId", { "seviarity": severity, "month": month, "year": year });
      return count.length;
    };

    const cveListCount = await Promise.all(months.map(async (month) => {
      const [criticalCount, highCount, mediumCount, lowCount] = await Promise.all([
        getCountsForSeverity("CRITICAL", month),
        getCountsForSeverity("HIGH", month),
        getCountsForSeverity("MEDIUM", month),
        getCountsForSeverity("LOW", month)
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
    console.log("error is" + error);
  }
};