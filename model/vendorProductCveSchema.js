import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';


const vendorProductCveSchema = new mongoose.Schema({
    vendorName:String,
    productName: String,
    date: String,
    month: Number,
    year: Number,
    fix:String,
    seviarity:String,
    cveId:String,
    cveDetails:JSON,
    fixLink:String,
    partNo:String,
    firmwareVersion: String,
    version:String,
    serialNo:String,
    osType:String,
    type: String,
    project:String,
    advisoryTitle:String,
    vulnerableComponent:String,
    vulnerableFeature:String,
    workarounds:String,
    fixedRelease:String,
    impactRate:String,
    cvssScore:String,
    advisoryUrl:String
});
vendorProductCveSchema.plugin(mongoosePaginate);



const vendorProductCve = mongoose.model('vendorProductCve', vendorProductCveSchema);

export default vendorProductCve;