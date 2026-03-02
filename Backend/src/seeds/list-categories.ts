// import { NestFactory } from '@nestjs/core';
// import { AppModule } from '../app.module';

// async function bootstrap() {
//     const app = await NestFactory.createApplicationContext(AppModule);
//     const categoryModel = app.get('CategoryModel');

//     const categories = await categoryModel.find({ isDeleted: false }).exec();

//     console.log(`Total Categories found: ${categories.length}`);
//     categories.forEach((c: any) => {
//         console.log(`- ${c.name} | _id: ${c._id} | parentId: ${c.parentId} | isActive: ${c.isActive}`);
//     });

//     await app.close();
//     process.exit(0);
// }

// bootstrap();
