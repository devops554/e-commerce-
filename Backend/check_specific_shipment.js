const mongoose = require('mongoose');
const { Types } = mongoose;

async function run() {
  await mongoose.connect('mongodb+srv://bivha:bivha8472@cluster0.uekp6sg.mongodb.net/ecommerce');
  const Shipment = mongoose.model('Shipment', new mongoose.Schema({}, { strict: false }));
  
  const orderId = '69bea994dff6d83c31a65d5d';
  const warehouseId = '69abb144d63535e414bd7e46';
  
  const shipments = await Shipment.find({ orderId: new Types.ObjectId(orderId) }).lean();
  
  console.log(`Found ${shipments.length} shipments for orderId: ${orderId}`);
  shipments.forEach((s, i) => {
    console.log(`Shipment ${i}:`);
    console.log(`  _id: ${s._id}`);
    console.log(`  warehouseId: ${s.warehouseId}`);
    console.log(`  orderId: ${s.orderId}`);
    console.log(`  status: ${s.status}`);
  });
  
  const shipmentsWithWarehouse = await Shipment.find({ 
    orderId: new Types.ObjectId(orderId),
    warehouseId: new Types.ObjectId(warehouseId)
  }).lean();
  
  console.log(`Found ${shipmentsWithWarehouse.length} shipments for orderId AND warehouseId`);

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
