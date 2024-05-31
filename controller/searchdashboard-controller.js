import OemProducts from '../model/oemProductsSchema.js';
import OemList from '../model/oemListSchema.js';
import vendorProductCveModel from '../model/vendorProductCveSchema.js';
import Inventory from '../model/inventorySchema.js';

export const searchCriteria = async (request, response) => {
    try {
        const { vendorName, cveId, productName, partNo, project, osType, version, firmwareVersion, page = 1, limit = request.body.pageSize } = request.body;
        const parsedLimit = parseInt(limit, 10);
        const options = {
            page: parseInt(page, 10),
            limit: parsedLimit,
            sort: { cveId: -1 },
        };

        // Construct the initial match stage
        const matchStage = {};
        if (cveId && cveId.length > 0) matchStage.cveId = { $in: cveId };
        if (vendorName && vendorName.length > 0) matchStage.vendorName = { $in: vendorName };
        if (productName && productName.length > 0) matchStage.productName = { $in: productName };
        if (partNo && partNo.length > 0) matchStage.partNo = { $in: partNo };
        if (firmwareVersion && firmwareVersion.length > 0) matchStage.firmwareVersion = { $in: firmwareVersion };
        if (version && version.length > 0) matchStage.version = { $in: version };
        if (project && project.length > 0) matchStage.project = { $in: project };
        if (osType && osType.length > 0) matchStage.osType = { $in: osType };

        const aggregationQuery = [
            { $match: matchStage },
            { $sort: options.sort },
            { $skip: (options.page - 1) * options.limit }, // Adjusted here
            { $limit: options.limit },
            {
                $lookup: {
                    from: "inventory",
                    localField: "partNo",
                    foreignField: "partNo",
                    as: "inventoryDetails"
                }
            },
            {
                $unwind: {
                    path: "$inventoryDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
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
                }
            }
        ];

        const results = await vendorProductCveModel.aggregate(aggregationQuery);

        // Response object preparation
        const total = await vendorProductCveModel.countDocuments(matchStage);
        const totalPages = Math.ceil(total / parsedLimit);

        response.json({
            docs: results,
            total,
            totalPages,
            page: options.page,
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
    }
};



export const getOemVendorList = async (request, response) => {
    try {
        const oemList = await OemList.find().sort({ oemName: 1 });
        response.json(oemList);
    } catch (error) {
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
        return response.status(500).json(error.message);
    }
};

export const getCveDetails = async (request, response) => {
    try {
        const cveId = request.body.cveId;
        const cveData = await vendorProductCveModel.distinct("cveDetails", { "cveId": cveId });
        response.json(cveData);
    } catch (error) {
        return response.status(500).json(error.message);
    }
};
