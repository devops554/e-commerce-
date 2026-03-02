
const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://AdminBivha:admin852963@cluster0.en8hnf5.mongodb.net/ecommerce';

async function checkProduct() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const productId = '69a1f10b03dccc7d74b027cd';
        const productType = '69a1dfae5571879d682129e9';

        const product = await mongoose.connection.db.collection('products').findOne({ _id: new mongoose.Types.ObjectId(productId) });
        console.log('Product Found:', product ? 'Yes' : 'No');
        if (product) {
            console.log('Product title:', product.title);
            console.log('Product productType:', product.productType);
            console.log('Product isActive:', product.isActive);
            console.log('Product isDeleted:', product.isDeleted);
        } else {
            // Check by slug if ID fails for some reason
            const pBySlug = await mongoose.connection.db.collection('products').findOne({ slug: 'amul-taaza-toned-milk-1-l' });
            if (pBySlug) {
                console.log('Found by slug instead of ID. Actual ID:', pBySlug._id);
            }
        }

        const variants = await mongoose.connection.db.collection('productvariants').find({ product: new mongoose.Types.ObjectId(productId) }).toArray();
        console.log('Variants found in variant collection:', variants.length);
        variants.forEach(v => {
            console.log(`- Variant SKU: ${v.sku}, isActive: ${v.isActive}, price: ${v.price}`);
        });

        const productsInType = await mongoose.connection.db.collection('products').countDocuments({ productType: new mongoose.Types.ObjectId(productType) });
        console.log('Total products with this productType:', productsInType);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkProduct();
