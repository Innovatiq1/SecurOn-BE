import cveModel from '../model/cveSchema.js';
import OemModel from '../model/oemSchema.js';
import vendorProductCveModel from '../model/vendorProductCveSchema.js';

export const RunCveFixScheduler = async (req, res) => {

  try {

    const oemcves = await OemModel.find({});
    let oemcvs = oemcves.length;
    let count = 0;

    for (const cve of oemcves) {
      count = count + 1;
      const cveData = await cveModel.findOne({ cveId: cve.cve });

      if (cveData) {

        // await cveModel.findByIdAndUpdate(cve._id, { fix: 'Y',fixLink:cve.fixLink });

        await cveModel.updateMany({ cveId: cveData.cveId }, { $set: { fix: 'Y', fixLink: cve.fixLink } })
      }


      const cveObj = await vendorProductCveModel.find({ cveId: cve.cve });

      if (cveObj) {
        //await vendorProductCveModel.findByIdAndUpdate(cve._id, { fix: 'Y',fixLink:cve.fixLink});
        await vendorProductCveModel.updateMany({ cveId: cveObj.cveId }, { $set: { fix: 'Y', fixLink: cve.fixLink } })
      }


      if (count == oemcvs) {

        res.send("scheduler run successfully");
      }

    }


  } catch (error) {
    console.log("error is" + error);
  }


};

export default RunCveFixScheduler;