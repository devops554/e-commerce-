const mongoose = require('mongoose');
const { Types } = mongoose;

async function run() {
  await mongoose.connect('mongodb+srv://bivha:bivha8472@cluster0.uekp6sg.mongodb.net/ecommerce');
  const Shipment = mongoose.model('Shipment', new mongoose.Schema({}, { strict: false }));
  
  const orderId = '69beaf1c59b95dc2aa09e04e';
  const shipments = await Shipment.find({ orderId: new Types.ObjectId(orderId) }).lean();
  
  let output = '';
  shipments.forEach(s => {
    output += 'SHIPMENT_START\n';
    output += 'ID: ' + s._id + '\n';
    output += 'STATUS: ' + s.status + '\n';
    output += 'WAREHOUSE: ' + (s.warehouseId ? s.warehouseId.toString() : 'NONE') + '\n';
    output += 'PARTNER: ' + (s.deliveryPartnerId ? s.deliveryPartnerId.toString() : 'NONE') + '\n';
    output += 'ORDER: ' + s.orderId.toString() + '\n';
    output += 'TYPE: ' + s.type + '\n';
    output += 'SHIPMENT_END\n';
  });
  
  require('fs').writeFileSync('final_output_clean.txt', output);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
