// import { NestFactory } from '@nestjs/core';
// import { AppModule } from '../app.module';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Product } from '../products/schemas/product.schema';

// async function bootstrap() {
//     const app = await NestFactory.createApplicationContext(AppModule);
//     await app.init(); // Ensure onModuleInit runs if it has side effects

//     const productModel = app.get('ProductModel');

//     console.log('Fetching ALL product documents directly from MongoDB...');
//     const products = await productModel.find({}).exec();

//     console.log(`Total Product documents found: ${products.length}`);
//     products.forEach((p: any) => {
//         console.log(`- ${p.title}`);
//         console.log(`  _id: ${p._id}`);
//         console.log(`  category: ${p.category} | subCategory: ${p.subCategory}`);
//         console.log(`  isActive: ${p.isActive} (type: ${typeof p.isActive})`);
//         console.log(`  isDeleted: ${p.isDeleted} (type: ${typeof p.isDeleted})`);
//         console.log('---');
//     });

//     await app.close();
//     process.exit(0);
// }

// bootstrap();
