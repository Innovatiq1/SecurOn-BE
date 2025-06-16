import mongoose from 'mongoose';


const affectedProductsSchema = new mongoose.Schema({
    vendor:String,
    productName:String,
    vulnerabilities:JSON,
    date: String,
    month: Number,
    year: Number,
    vulnerabilitesCount:Number,
    link:String
});


const affectedProducts = mongoose.model('topaffectedproducts', affectedProductsSchema);

export default affectedProducts;