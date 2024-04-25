import mongoose from 'mongoose';
//import mongoosePaginate from 'mongoose-paginate';

const cveSchema = new mongoose.Schema({
    date: String,
    month: Number,
    year: Number,
    cveId:String,
    fix:String,
    seviarity:String,
    cveDetails:JSON,
    fixLink:String  
});
//cveSchema.plugin(mongoosePaginate);

const cve = mongoose.model('cve', cveSchema);

export default cve;