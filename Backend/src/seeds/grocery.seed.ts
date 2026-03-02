// import { NestFactory } from '@nestjs/core';
// import { AppModule } from '../app.module';
// import { ProductsService } from '../products/products.service';
// import { UsersService } from '../users/users.service';
// import { UserRole } from '../users/schemas/user.schema';

// async function bootstrap() {
//     const app = await NestFactory.createApplicationContext(AppModule);
//     const productsService = app.get(ProductsService);
//     const usersService = app.get(UsersService);

//     // Mapped from existing database categories
//     const categoryMapping = [
//         {
//             parentName: 'Pulses & Lentils',
//             parentId: '69a20a00502fce4f16977064',
//             subcategories: [
//                 {
//                     id: '69a28b6a884924414e857207', name: 'Toor & Arhar Dal', products: [
//                         { name: 'Tata Sampann Unpolished Toor Dal', brand: 'Tata Sampann', price: 185, weight: '1kg' },
//                         { name: 'Aashirvaad Toor Dal', brand: 'Aashirvaad', price: 175, weight: '1kg' }
//                     ]
//                 },
//                 {
//                     id: '69a28ba3884924414e857211', name: 'Chana Dal & Bengal Gram', products: [
//                         { name: 'Fortune Premium Chana Dal', brand: 'Fortune', price: 98, weight: '1kg' },
//                         { name: 'Tata Sampann Chana Dal', brand: 'Tata Sampann', price: 105, weight: '1kg' }
//                     ]
//                 }
//             ]
//         },
//         {
//             parentName: 'Oils & Ghee',
//             parentId: '69a20976502fce4f1697705d',
//             subcategories: [
//                 {
//                     id: '69a28c8e884924414e857290', name: 'Cooking Oils', products: [
//                         { name: 'Fortune Sunlite Sunflower Oil', brand: 'Fortune', price: 155, weight: '1L' },
//                         { name: 'Saffola Gold Healthy Oil', brand: 'Saffola', price: 170, weight: '1L' }
//                     ]
//                 },
//                 {
//                     id: '69a28d2a884924414e857364', name: 'Cow Ghee', products: [
//                         { name: 'Amul Pure Cow Ghee', brand: 'Amul', price: 630, weight: '1L' },
//                         { name: 'Mother Dairy Cow Ghee', brand: 'Mother Dairy', price: 610, weight: '1L' }
//                     ]
//                 }
//             ]
//         },
//         {
//             parentName: 'Cereals & Grains',
//             parentId: '69a20886502fce4f16977054',
//             subcategories: [
//                 {
//                     id: '69a28e13884924414e8573e9', name: 'Rice & Rice Products', products: [
//                         { name: 'India Gate Basmati Rice', brand: 'India Gate', price: 130, weight: '1kg' },
//                         { name: 'Daawat Rozana Rice', brand: 'Daawat', price: 95, weight: '1kg' }
//                     ]
//                 },
//                 {
//                     id: '69a28e46884924414e8573f3', name: 'Wheat & Flour (Atta)', products: [
//                         { name: 'Aashirvaad Superior Atta', brand: 'Aashirvaad', price: 460, weight: '10kg' },
//                         { name: 'Fortune Chakki Fresh Atta', brand: 'Fortune', price: 430, weight: '10kg' }
//                     ]
//                 }
//             ]
//         }
//     ];

//     console.log('Seeding Grocery Products into existing categories...');

//     let user = await (usersService as any).userModel.findOne({
//         role: { $in: [UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.SELLER] }
//     });
//     if (!user) {
//         user = await usersService.create({
//             name: 'System Admin',
//             email: 'admin@grocery.com',
//             password: 'SeededPassword123!',
//             role: UserRole.ADMIN,
//         });
//     }
//     const userId = user._id.toString();

//     for (const catGroup of categoryMapping) {
//         for (const sub of catGroup.subcategories) {
//             console.log(`Processing Subcategory: ${sub.name} (${sub.id})`);
//             for (const prod of sub.products) {
//                 const productData = {
//                     title: prod.name,
//                     description: `Premium ${prod.name} by ${prod.brand}. This product is carefully selected for the highest quality and purity. Perfect for your daily household needs.`,
//                     shortDescription: `${prod.brand} ${catGroup.parentName}`,
//                     category: sub.id,
//                     productType: '69a1dfae5571879d682129e9', // Grocery Type ID from user JSON
//                     brand: prod.brand,
//                     baseSku: `${prod.brand.substring(0, 3).toUpperCase()}-${prod.name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
//                     thumbnail: {
//                         url: `https://images.unsplash.com/photo-${1600000000000 + Math.floor(Math.random() * 1000000000)}?auto=format&fit=crop&q=80&w=400`,
//                         publicId: `seeded-grocery-${Math.random().toString(36).substring(7)}`
//                     },
//                     isActive: true,
//                     createdBy: userId
//                 };

//                 try {
//                     const product = await productsService.create(productData as any, userId);
//                     console.log(`  + Created Product: ${product.title}`);

//                     // Variant 1
//                     await productsService.createVariant({
//                         product: product._id as any,
//                         sku: `${product.baseSku}-REG`,
//                         price: prod.price,
//                         discountPrice: Math.floor(prod.price * 0.95),
//                         stock: 100,
//                         attributes: {
//                             weight: prod.weight,
//                             packaging: 'Standard'
//                         },
//                         isActive: true
//                     } as any);

//                     // Variant 2
//                     await productsService.createVariant({
//                         product: product._id as any,
//                         sku: `${product.baseSku}-VAL`,
//                         price: Math.floor(prod.price * 1.8),
//                         discountPrice: Math.floor(prod.price * 1.7),
//                         stock: 50,
//                         attributes: {
//                             weight: prod.weight.includes('kg') ? (parseInt(prod.weight) * 2) + 'kg' : prod.weight,
//                             packaging: 'Value Pack'
//                         },
//                         isActive: true
//                     } as any);
//                     console.log(`    * Created 2 variants for ${product.title}`);
//                 } catch (err) {
//                     console.error(`  - Failed to create ${prod.name}:`, err.message);
//                 }
//             }
//         }
//     }

//     console.log('Grocery Product Seeding completed!');
//     await app.close();
// }

// bootstrap().catch((err) => {
//     console.error('Seeding failed:', err);
//     process.exit(1);
// });
