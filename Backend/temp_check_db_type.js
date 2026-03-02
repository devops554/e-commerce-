
const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://AdminBivha:admin852963@cluster0.en8hnf5.mongodb.net/ecommerce';

async function checkProduct() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const productId = '69a1f10b03dccc7d74b027cd';
        const productType = '69a1dfae5571879d682129e9';

        const product = await mongoose.connection.db.collection('products').findOne({ _id: new mongoose.Types.ObjectId(productId) });
        if (product) {
            console.log('Product productType value:', product.productType);
            console.log('Product productType type:', typeof product.productType);
            console.log('Is productType an ObjectId instance?', product.productType instanceof mongoose.Types.ObjectId);

            // Check counts with both
            const countAsId = await mongoose.connection.db.collection('products').countDocuments({ productType: new mongoose.Types.ObjectId(productType) });
            const countAsString = await mongoose.connection.db.collection('products').countDocuments({ productType: productType });

            console.log('Count as ObjectId:', countAsId);
            console.log('Count as String:', countAsString);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkProduct();
