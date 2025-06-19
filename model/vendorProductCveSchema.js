import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';


const vendorProductCveSchema = new mongoose.Schema({
    vendorName: String,
    productName: String,
    date: String,
    month: Number,
    year: Number,
    fix: String,
    seviarity: String,
    cveId: String,
    cveDetails: JSON,
    fixLink: String,
    partNo: String,
    firmwareVersion: String,
    version: String,
    serialNo: String,
    osType: String,
    type: String,
    project: String,
    advisoryTitle: String,
    vulnerableComponent: String,
    vulnerableFeature: String,
    workarounds: String,
    fixedRelease: String,
    impactRate: String,
    cvssScore: String,
    advisoryUrl: String
});

// Add indexes for frequently queried fields
vendorProductCveSchema.index({ vendorName: 1 });
vendorProductCveSchema.index({ partNo: 1 });
vendorProductCveSchema.index({ osType: 1 });
vendorProductCveSchema.index({ version: 1 });
vendorProductCveSchema.index({ cveId: 1 });
vendorProductCveSchema.index({ date: 1 });

// Compound indexes for common query patterns
vendorProductCveSchema.index({ vendorName: 1, partNo: 1 });
vendorProductCveSchema.index({ vendorName: 1, osType: 1 });
vendorProductCveSchema.index({ vendorName: 1, version: 1 });

vendorProductCveSchema.plugin(mongoosePaginate);

const vendorProductCve = mongoose.model('vendorProductCve', vendorProductCveSchema);

export default vendorProductCve;