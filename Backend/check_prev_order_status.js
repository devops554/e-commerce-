const mongoose = require('mongoose');
const { Types } = mongoose;

async function run() {
  await mongoose.connect('mongodb+srv://bivha:bivha8472@cluster0.uekp6sg.mongodb.net/ecommerce');
  const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
  
  const orderId = '69beaf1c59b95dc2aa09e04e';
  const order = await Order.findById(new Types.ObjectId(orderId)).lean();
  
  if (order) {
    console.log(`Order ${orderId}:`);
    console.log(`  orderStatus: ${order.orderStatus}`);
    console.log(`  paymentStatus: ${order.paymentStatus}`);
  } else {
    console.log(`Order ${orderId} NOT FOUND`);
  }
  
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
