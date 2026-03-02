// const mongoose = require('mongoose');

// // Try to find a way to get the URI or check if it's in process.env
// console.log('Environment variables check:');
// console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'FOUND' : 'NOT FOUND');

// if (!process.env.MONGODB_URI) {
//     console.log('Attempting to connect to default localhost:27017/e-commerce...');
//     const uri = 'mongodb://localhost:27017/e-commerce';
//     mongoose.connect(uri)
//         .then(() => {
//             console.log('Connected successfully to localhost!');
//             process.exit(0);
//         })
//         .catch(err => {
//             console.error('Connection failed:', err.message);
//             process.exit(1);
//         });
// } else {
//     mongoose.connect(process.env.MONGODB_URI)
//         .then(() => {
//             console.log('Connected successfully using MONGODB_URI!');
//             process.exit(0);
//         })
//         .catch(err => {
//             console.error('Connection failed:', err.message);
//             process.exit(1);
//         });
// }

// setTimeout(() => {
//     console.log('Connection timed out after 5s');
//     process.exit(1);
// }, 5000);
