import mongoose from 'mongoose';

const logsSchema = new mongoose.Schema({
    date: String,
    month: Number,
    year: Number,
    cveId:String,
    fix:String,
    seviarity:String,
    cveDetails:JSON,
    fixLink:String,
    type:String
});


const cvelog = mongoose.model('cvelog', logsSchema);

export default cvelog;