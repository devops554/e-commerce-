// import { NestFactory } from '@nestjs/core';
// import { AppModule } from '../app.module';
// import { ProductsService } from '../products/products.service';
// import { CategoriesService } from '../categories/categories.service';
// import { UsersService } from '../users/users.service';
// import { UserRole } from '../users/schemas/user.schema';

// async function bootstrap() {
//     console.log('Starting seeding context...');
//     const app = await NestFactory.createApplicationContext(AppModule);

//     try {
//         const productsService = app.get(ProductsService);
//         const categoriesService = app.get(CategoriesService);
//         const usersService = app.get(UsersService);

//         console.log('Seeding products...');

//         // Find an admin or seller user to own the products
//         let user = await (usersService as any).userModel.findOne({
//             role: { $in: [UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.SELLER] }
//         });

//         if (!user) {
//             console.log('No user with appropriate role found. Creating a dummy admin...');
//             user = await usersService.create({
//                 name: 'System Admin',
//                 email: 'admin@bivha.com',
//                 password: 'SeededPassword123!',
//                 role: UserRole.ADMIN,

//             });
//         }

//         const userId = user._id.toString();
//         const categories = await categoriesService.findAll({ limit: 500 }); // Increase limit to get all
//         const catList = categories.categories;

//         if (catList.length === 0) {
//             console.log('No categories found. Please run seed:categories first.');
//             process.exit(1);
//         }

//         const productModel = (productsService as any).productModel;

//         for (const category of catList) {
//             const currentCount = await productModel.countDocuments({ category: category._id });
//             console.log(`Category: ${category.name} | Current Products: ${currentCount}`);

//             const productsToCreate = Math.max(0, 2 - currentCount);

//             for (let i = 0; i < productsToCreate; i++) {
//                 const productIndex = currentCount + i + 1;
//                 const baseSku = `${category.name.substring(0, 3).toUpperCase()}-${category.slug.substring(0, 3).toUpperCase()}-${productIndex}`.replace(/ /g, '');

//                 const productData = {
//                     title: `${category.name} Premium - ${productIndex}`,
//                     description: `High quality ${category.name} curated for BivhaShop.`,
//                     shortDescription: `Best in ${category.name}`,
//                     category: category._id,
//                     productType: (category as any).productType?._id || (category as any).productType,
//                     brand: 'Bivha Premium',
//                     baseSku: baseSku,
//                     thumbnail: {
//                         url: `https://images.unsplash.com/photo-${1600000000000 + Math.floor(Math.random() * 1000000000)}?auto=format&fit=crop&q=80&w=400`,
//                         publicId: `seeded-${baseSku.toLowerCase()}`
//                     },
//                     images: [],
//                     isActive: true,
//                     createdBy: userId
//                 };

//                 try {
//                     const product = await productsService.create(productData as any, userId);
//                     console.log(`  + Created product: ${product.title}`);

//                     // Create 2 variants for each
//                     for (let j = 1; j <= 2; j++) {
//                         await productsService.createVariant({
//                             product: product._id as any,
//                             sku: `${baseSku}-V${j}`,
//                             price: (100 * j) + Math.floor(Math.random() * 900),
//                             discountPrice: Math.random() > 0.5 ? (90 * j) + Math.floor(Math.random() * 50) : undefined,
//                             stock: 100,
//                             attributes: {
//                                 color: j === 1 ? 'White' : 'Silver',
//                                 size: j === 1 ? 'Regular' : 'Large'
//                             },
//                             isActive: true
//                         } as any);
//                     }
//                 } catch (err) {
//                     console.error(`  - Failed to create product for ${category.name}:`, err.message);
//                 }
//             }
//         }

//         console.log('Seeding completed successfully!');
//     } catch (error) {
//         console.error('Seeding failed:', error);
//     } finally {
//         await app.close();
//         process.exit(0);
//     }
// }

// bootstrap().catch(err => {
//     console.error('Critical seeding error:', err);
//     process.exit(1);
// });
