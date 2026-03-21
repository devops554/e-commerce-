const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Define minimal schema
    const schema = new mongoose.Schema({}, { strict: false, collection: 'partneroffers' });
    const OfferModel = mongoose.model('PartnerOfferTest', schema);
    
    const now = new Date();
    console.log('Now:', now);
    
    const allOffers = await OfferModel.find({});
    console.log('Total offers:', allOffers.length);
    
    if (allOffers.length > 0) {
      const o = allOffers[0];
      console.log('First offer validity:', o.validFrom, 'to', o.validTo);
      console.log('Is validFrom <= now?', o.validFrom <= now);
      console.log('Is validTo >= now?', o.validTo >= now);
      console.log('Is active?', o.isActive);
      console.log('applicablePartners:', o.applicablePartners);
      console.log('applicablePartners type:', Array.isArray(o.applicablePartners));
      console.log('applicablePartners length:', o.applicablePartners?.length);
    }

    const activeOffers = await OfferModel.find({
      isActive: true,
      validFrom: { $lte: now },
      validTo: { $gte: now },
      $or: [{ applicablePartners: { $size: 0 } }],
    });
    
    console.log('Filtered active offers count:', activeOffers.length);
    
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

run();
