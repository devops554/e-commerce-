const mongoose = require('mongoose');
const { Types } = mongoose;

async function run() {
  await mongoose.connect('mongodb+srv://bivha:bivha8472@cluster0.uekp6sg.mongodb.net/ecommerce');
  const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
  
  const orderId = '69beaf1c59b95dc2aa09e04e';
  const order = await Order.findById(new Types.ObjectId(orderId)).lean();
  
  if (order && order.history) {
    console.log(`History for Order ${orderId}:`);
    order.history.forEach((h, i) => {
      console.log(`${i}: ${h.action} -> ${h.status} (${h.note || ''}) @ ${h.timestamp}`);
    });
  } else {
    console.log(`Order ${orderId} history NOT FOUND`);
  }
  
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
