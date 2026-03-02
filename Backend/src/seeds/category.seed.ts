// import { NestFactory } from '@nestjs/core';
// import { AppModule } from '../app.module';
// import { ProductTypesService } from '../product-types/product-types.service';
// import { CategoriesService } from 'src/categories/categories.service';

// async function bootstrap() {
//     const app = await NestFactory.createApplicationContext(AppModule);
//     const categoriesService = app.get(CategoriesService);
//     const productTypesService = app.get(ProductTypesService);

//     const SYSTEM_USER_ID = '507f1f77bcf86cd799439011'; // Dummy ID for seeding

//     const categoriesData = [
//         {
//             name: 'Electronics',
//             type: 'Electronics',
//             description: 'Gadgets, appliances, and more',
//             subcategories: ['Mobile Phones', 'Laptops', 'Cameras', 'Headphones', 'Smartwatches'],
//         },
//         {
//             name: 'Fashion',
//             type: 'Clothing',
//             description: 'Clothing, footwear, and accessories',
//             subcategories: ['Men\'s Wear', 'Women\'s Wear', 'Kids\' Wear', 'Footwear', 'Watches'],
//         },
//         {
//             name: 'Home & Kitchen',
//             type: 'Home Decor',
//             description: 'Furniture, decor, and kitchenware',
//             subcategories: ['Furniture', 'Home Decor', 'Kitchen Appliances', 'Cookware', 'Bedding'],
//         },
//         {
//             name: 'Beauty & Personal Care',
//             type: 'Personal Care',
//             description: 'Makeup, skincare, and grooming',
//             subcategories: ['Makeup', 'Skincare', 'Haircare', 'Fragrances', 'Personal Hygiene'],
//         },
//     ];

//     console.log('Seeding product types and categories...');

//     for (const cat of categoriesData) {
//         // 1. Ensure ProductType exists
//         let productType;
//         try {
//             name: cat.type,
//                 description: `${cat.type} product type`,
//                     isActive: true
//         }, SYSTEM_USER_ID);
//         console.log(`Created Product Type: ${productType.name}`);
//     } catch (error) {
//         if (error.status === 409) {
//             console.log(`Product Type already exists: ${cat.type}`);
//             productType = await (productTypesService as any).productTypeModel.findOne({ name: cat.type }).exec();
//         } else {
//             throw error;
//         }
//     }

//     if (!productType) continue;

//     // 2. Create Main Category
//     let parent;
//     try {
//         name: cat.name,
//             description: cat.description,
//                 isActive: true,
//                     productType: productType._id.toString(),
//             }, SYSTEM_USER_ID);
//     console.log(`Created Main Category: ${parent.name}`);
// } catch (error) {
//     if (error.status === 409) {
//         console.log(`Main Category already exists: ${cat.name}`);
//         parent = await (categoriesService as any).categoryModel.findOne({ name: cat.name }).exec();
//     } else {
//         throw error;
//     }
// }

// if (parent) {
//     for (const subName of cat.subcategories) {
//         try {
//             name: subName,
//                 description: `${subName} under ${cat.name}`,
//                     parentId: (parent as any)._id.toString(),
//                         isActive: true,
//                             productType: productType._id.toString(),
//                     }, SYSTEM_USER_ID);
//         console.log(`  - Created Subcategory: ${subName}`);
//     } catch (error) {
//         if (error.status === 409) {
//             console.log(`  - Subcategory already exists: ${subName}`);
//         } else {
//             throw error;
//         }
//     }
// }
//         }
//     }

// console.log('Seeding completed successfully!');
// await app.close();
// }

// bootstrap().catch((err) => {
//     console.error('Error seeding categories:', err);
//     process.exit(1);
// });
