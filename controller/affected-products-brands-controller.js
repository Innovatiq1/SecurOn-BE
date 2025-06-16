import AffectedProductsModel from '../model/affectedProductsSchema.js';
import OemListModel from '../model/oemListSchema.js';
import axios from 'axios';



export const runTopAffectedProductsBrandsScheduler = async (request, response) => {
    try {
        // Log start of scheduler
        console.info('OEM Product Scheduler has started to fetch products from NIST for the uploaded OEMs');

        // Fetch OEM list from the database
        const oemList = await OemListModel.find({ });

        for (const oem of oemList) {
            try {
                const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${oem.oemName}`;
                
                const apiResponse = await axios.get(url, {
                    headers: { 'apikey': '2d3a2cf2-1934-4620-bce2-f69b9e5dfb43' }
                });

                const cveDetails = apiResponse.data;
                const vulnerabilitesCount = cveDetails.totalResults;

                // Check if the vendor already exists in the database
                const existingProduct = await AffectedProductsModel.findOne({ vendor: oem.oemName });

                if (existingProduct) {
                    // Update the existing record
                    existingProduct.vulnerabilitesCount = vulnerabilitesCount;
                    await existingProduct.save();
                    console.log(`Record updated successfully for vendor: ${oem.oemName}`);
                } else {
                    // Create a new record if it doesn't exist
                    await AffectedProductsModel.create({
                        vendor: oem.oemName,
                        vulnerabilitesCount: vulnerabilitesCount
                    });
                    console.log(`New record created for vendor: ${oem.oemName}`);
                }
            } catch (error) {
                console.error(`Error processing OEM ${oem.oemName}:`, error.message);
                // Log error with your logger if necessary
            }
        }

        response.status(200).json({ message: "Scheduler ran successfully" });
    } catch (error) {
        console.error("Error in scheduler execution:", error.message);
        response.status(500).json({ error: "Error in scheduler execution" });
    }
};


             
        
          

export const getAffectedProducts = async (request, response) => {
    const { vendor, fromDate, toDate } = request.body;

    const getDateRangeQuery = () => {
        const formatDate = (date) => {
            date.setHours(19, 0, 0, 0); 
            return date.toISOString().replace('Z', ''); 
        };

        if (!fromDate && !toDate) {
            const currentDate = new Date();
            const lastMonthDate = new Date();
            lastMonthDate.setMonth(currentDate.getMonth() - 1);

            return {
                $gte: lastMonthDate,
                $lte: currentDate,
            };
        } else {
            return {
                $gte: formatDate(new Date(fromDate)),
                $lte: formatDate(new Date(toDate)),
            };
        }
    };

    try {
        const dateRangeQuery = getDateRangeQuery();
        const query = {  };
        if (vendor) {
            query.vendor = vendor;
        }

        // console.log("Query:", query);

        const affectedProducts = await AffectedProductsModel.find(query)
            .select('productName date vulnerabilitesCount link') 
            .lean(); 

        response.status(200).json(affectedProducts);
    } catch (error) {
        console.error('Error fetching affected products:', error);
        response.status(500).json({ error: 'Error fetching affected products' });
    }
};



export const getTopAffectedProducts = async (request, response) => {
    const { fromDate, toDate } = request.body;

    const getDateRangeQuery = () => {
        const formatDate = (date) => {
            date.setHours(19, 0, 0, 0); 
            return date.toISOString().replace('Z', ''); 
        };

        if (!fromDate && !toDate) {
            const currentDate = new Date();
            const lastMonthDate = new Date();
            lastMonthDate.setMonth(currentDate.getMonth() - 1);

            return {
                $gte: lastMonthDate,
                $lte: currentDate,
            };
        } else {
            return {
                $gte: formatDate(new Date(fromDate)),
                $lte: formatDate(new Date(toDate)),
            };
        }
    };

    try {
        const dateRangeQuery = getDateRangeQuery();

        const [oemList, affectedProducts] = await Promise.all([
            OemListModel.find({}, 'oemName').lean(), 
            AffectedProductsModel.find({
                // date: dateRangeQuery,
                // vendor: { $in: await OemListModel.distinct("oemName") },
            })
                .select('vendor date vulnerabilitesCount link') 
                .lean(), 
        ]);

        response.status(200).json(affectedProducts);
    } catch (error) {
        console.error('Error fetching affected products:', error);
        response.status(500).json({ error: 'Error fetching affected products' });
    }
};
