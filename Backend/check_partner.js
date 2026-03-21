const mongoose = require('mongoose');
const { Types } = mongoose;

async function run() {
  await mongoose.connect('mongodb+srv://bivha:bivha8472@cluster0.uekp6sg.mongodb.net/ecommerce');
  const Partner = mongoose.model('DeliveryPartner', new mongoose.Schema({}, { strict: false }));
  
  const partnerId = '69ac30d7c79c5fb5b1402e66';
  const partner = await Partner.findById(new Types.ObjectId(partnerId)).lean();
  
  console.log('Partner:', JSON.stringify(partner, null, 2));
  
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
