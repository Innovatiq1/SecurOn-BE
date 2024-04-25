import mongoose from 'mongoose';


const oemListSchema = new mongoose.Schema({
    oemName:String  
});


const oemList = mongoose.model('oem', oemListSchema);

export default oemList;