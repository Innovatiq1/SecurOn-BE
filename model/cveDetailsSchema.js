import mongoose from 'mongoose';
//import mongoosePaginate from 'mongoose-paginate';

const cveDetailsSchema = new mongoose.Schema({
    date: String,
    month: Number,
    year: Number,
    cveId:String,
    fix:String,
    cveDetails:JSON,
    seviarity:String,
    vendor:String,
    brand:String,
    oemLink:String
});

const cvedetail = mongoose.model('cvedetail', cveDetailsSchema);

export default cvedetail;