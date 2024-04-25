import mongoose from 'mongoose';


const oemProductsSchema = new mongoose.Schema({
    oemName:String,
    cpeName:String,
    productType:String,
    cpeNameId: String,
    title: String,
    version:String,
    cpeDetails:JSON    
});


const oemProducts = mongoose.model('products', oemProductsSchema);

export default oemProducts;