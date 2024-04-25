import mongoose from 'mongoose';

const Connection = async (username, password) => {
        const URL = `mongodb+srv://rajender503:WUnxIe30cNF7GfHL@cluster0.2tc04ol.mongodb.net/cve-tracker-uat?retryWrites=true&w=majority`;
    try {
        await mongoose.connect(URL, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false });
        console.log('Database Connected Succesfully');
    } catch(error) {
        console.log('Error: ', error.message);
    }

};

export default Connection;