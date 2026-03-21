const mongoose = require('mongoose');
const { Types } = mongoose;

async function run() {
  await mongoose.connect('mongodb+srv://bivha:bivha8472@cluster0.uekp6sg.mongodb.net/ecommerce');
  const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
  
  const orderId = '69bea994dff6d83c31a65d5d';
  const order = await Order.findById(new Types.ObjectId(orderId)).lean();
  
  if (order) {
    console.log(`Order ${orderId}:`);
    console.log(`  _id: ${order._id}`);
    console.log(`  orderId: ${order.orderId}`);
    console.log(`  orderStatus: ${order.orderStatus}`);
    console.log(`  paymentMethod: ${order.paymentMethod}`);
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
