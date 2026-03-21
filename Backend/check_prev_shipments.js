const mongoose = require('mongoose');
const { Types } = mongoose;

async function run() {
  await mongoose.connect('mongodb+srv://bivha:bivha8472@cluster0.uekp6sg.mongodb.net/ecommerce');
  const Shipment = mongoose.model('Shipment', new mongoose.Schema({}, { strict: false }));
  
  const orderId = '69beaf1c59b95dc2aa09e04e';
  const shipments = await Shipment.find({ orderId: new Types.ObjectId(orderId) }).lean();
  
  console.log(`Found ${shipments.length} shipments for orderId: ${orderId}`);
  shipments.forEach((s, i) => {
    console.log(`Shipment ${i}:`);
    console.log(`  _id: ${s._id}`);
    console.log(`  status: ${s.status}`);
    console.log(`  createdAt: ${s.createdAt}`);
  });
  
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
