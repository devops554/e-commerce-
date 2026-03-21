const mongoose = require('mongoose');
const { Types } = mongoose;

async function run() {
  await mongoose.connect('mongodb+srv://bivha:bivha8472@cluster0.uekp6sg.mongodb.net/ecommerce');
  const Warehouse = mongoose.model('Warehouse', new mongoose.Schema({}, { strict: false }));
  
  const warehouseId = '69abb144d63535e414bd7e46';
  const warehouse = await Warehouse.findById(new Types.ObjectId(warehouseId)).lean();
  
  console.log('Warehouse:', JSON.stringify(warehouse, null, 2));
  
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
