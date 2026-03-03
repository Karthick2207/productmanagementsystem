import mongoose from 'mongoose';
import { Product } from './src/models/Product';
import dotenv from 'dotenv';
dotenv.config();

const cleanAndSync = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/promanage';
        await mongoose.connect(mongoURI);

        // Find duplicates and remove them
        const duplicates = await Product.aggregate([
            { $group: { _id: "$name", count: { $sum: 1 }, ids: { $push: "$_id" } } },
            { $match: { count: { $gt: 1 } } }
        ]);

        for (const doc of duplicates) {
            // Keep the first one, delete the rest
            const toDelete = doc.ids.slice(1);
            await Product.deleteMany({ _id: { $in: toDelete } });
            console.log(`Deleted ${toDelete.length} duplicates for product: ${doc._id}`);
        }

        await Product.syncIndexes();
        console.log("Indexes synchronized successfully");

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}
cleanAndSync();
