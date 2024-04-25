import mongoose from 'mongoose';


const oemCveSchema = new mongoose.Schema({
    oemName:String,
    cveId: String,
    cveDetails:JSON    
});


const oemCve = mongoose.model('oemCve', oemCveSchema);

export default oemCve;