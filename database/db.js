import mongoose from 'mongoose';

const Connection = async (username, password) => {
        try {
            await mongoose.connect(`mongodb+srv://premkumar:CfY4y95Jx6bbD7aO@cluster0.2tc04ol.mongodb.net/cve-tracker-uat?retryWrites=true&w=majority`, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 90000
                
            });
            console.log('Database Connected Succesfully');
        } catch (error) {
            console.error('Error connecting to MongoDB Atlas:', error.message);
        }

};

export default Connection;