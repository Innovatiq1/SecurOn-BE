import OemProducts from '../model/oemProductsSchema.js';
import OemList from '../model/oemListSchema.js';
import vendorProductCveModel from '../model/vendorProductCveSchema.js';
import Inventory from '../model/inventorySchema.js';

export const searchCriteria = async (request, response) => {
    try {
        const { vendorName, cveId, productName, partNo, project, osType, version, firmwareVersion, page = 1, limit = 10 } = request.body;
        const searchResults = [];
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, request.body.pageSize),
            sort: { cveId: -1 },
        };
        const query = {};

        if (cveId && cveId.length > 0) {
            query.cveId = { $in: cveId };
        }

        if (vendorName && vendorName.length > 0) {
            query.vendorName = { $in: vendorName };
        }

        if (productName && productName.length > 0) {
            query.productName = { $in: productName };
        }

        if (partNo && partNo.length > 0) {
            query.partNo = { $in: partNo }; // Updated to direct match
        }

        if (firmwareVersion && firmwareVersion.length > 0) {
            query.firmwareVersion = { $in: firmwareVersion }; // Updated to direct match
        }

        if (version && version.length > 0) {
            query.version = { $in: version }; // Updated to direct match
        }

        if (project && project.length > 0) {
            query.project = { $in: project }; // Updated to direct match
        }

        if (osType && osType.length > 0) {
            query.osType = { $in: osType }; // Updated to direct match
        }

        const total = await vendorProductCveModel.countDocuments(query);
        const totalPages = Math.ceil(total / options.limit);

        const result = await vendorProductCveModel.find(query)
            .sort(options.sort)
            .skip((options.page - 1) * options.limit)
            .limit(options.limit);

        for (const cveRecord of result) {
            const inventoryRecord = await Inventory.findOne({
                vendor: cveRecord.vendorName,
                product: cveRecord.productName,
                partNo: cveRecord.partNo,
                firmwareVersion: cveRecord.firmwareVersion,
                project: cveRecord.project,
                osType: cveRecord.osType
            });

            if (inventoryRecord) {
                searchResults.push({
                    cveId: cveRecord.cveId,
                    vendorName: cveRecord.vendorName,
                    productName: cveRecord.productName,
                    firmwareVersion: inventoryRecord.firmwareVersion,
                    partNo: inventoryRecord.partNo,
                    serialNo: inventoryRecord.serialNo,
                    affectedCve: true,
                    severity: cveRecord.severity, // Corrected typo
                    fix: cveRecord.fix,
                    osType: inventoryRecord.osType,
                    projectId: inventoryRecord.project, // Include projectId here
                    project: inventoryRecord.project
                });
            } else {
                console.log("No matching inventory record found. Searching Inventory collection...");
                let matchedRecords;

                if (query.project) {
                    matchedRecords = await Inventory.find({ "vendor": cveRecord.vendorName, "partNo": cveRecord.partNo, "project": cveRecord.project, "firmwareVersion": cveRecord.version });
                } else if (query.osType) {
                    matchedRecords = await Inventory.find({ "vendor": cveRecord.vendorName, "partNo": cveRecord.partNo, "osType": cveRecord.osType, "firmwareVersion": cveRecord.version });
                } else {
                    matchedRecords = await Inventory.find({ "vendor": cveRecord.vendorName, "partNo": cveRecord.partNo, "firmwareVersion": cveRecord.version });
                }

                console.log("Matched records from Inventory collection:", matchedRecords);
                if (matchedRecords.length > 0) {
                    matchedRecords.forEach(record => {
                        searchResults.push({
                            ...cveRecord.toObject(),
                            project: record.project
                        });
                    });
                } else {
                    console.log("No matching records found in Inventory collection for:", cveRecord);
                    searchResults.push(cveRecord.toObject());
                }
            }
        }

        response.json({
            docs: searchResults,
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
