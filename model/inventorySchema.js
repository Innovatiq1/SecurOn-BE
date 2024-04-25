import mongoose from 'mongoose';
//import mongoosePaginate from 'mongoose-paginate';

const inventorySchema = new mongoose.Schema({
    project:String,
    vendor: String,
    osType: String,
    partNo: String,
    product: String,
    cpeName: String,
    type: String,
    serialNo: String,
    firmwareVersion: String,
    status: String,
    vulnarabilities: Number,
    projectId: String
});
//inventorySchema.plugin(mongoosePaginate);

const inventory = mongoose.model('asset', inventorySchema);

export default inventory;