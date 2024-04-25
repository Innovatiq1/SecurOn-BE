import mongoose from 'mongoose';


const oemSchema = new mongoose.Schema({
    oemName:String,
    cve: String,
    content:String,
    advisory:String,
    //cveid:String,
    severity:String ,
    releasedate:String,
    lastdate:String,
    fixedversion:String,
    fixLink:String
});


const oem = mongoose.model('cveFix', oemSchema);

export default oem;