// import { NestFactory } from '@nestjs/core';
// import { AppModule } from '../app.module';
// import { CategoriesService } from '../categories/categories.service';

// async function bootstrap() {
//     const app = await NestFactory.createApplicationContext(AppModule);
//     const categoriesService = app.get(CategoriesService);

//     console.log('Testing category slug update...');

//     // 1. Create a category
//     const name = 'Test Slug Update';
//     const category = await categoriesService.create({
//         name,
//         description: 'Testing slug update',
//         productType: 'Test Product Type',
//     });
//     console.log(`Created category: ${category.name}, Slug: ${category.slug}`);

//     // 2. Update the name
//     const newName = 'Updated Slug Test';
//     const updatedCategory = await categoriesService.update((category as any)._id.toString(), {
//         name: newName,
//     });
//     console.log(`Updated category: ${updatedCategory.name}, New Slug: ${updatedCategory.slug}`);

//     if (updatedCategory.slug === 'updated-slug-test') {
//         console.log('Verification SUCCESS: Slug updated correctly!');
//     } else {
//         console.log('Verification FAILED: Slug did not update correctly.');
//     }

//     // Clean up
//     await (categoriesService as any).categoryModel.findByIdAndDelete((category as any)._id);
//     console.log('Cleaned up test category.');

//     await app.close();
// }

// bootstrap().catch((err) => {
//     console.error('Error during verification:', err);
//     process.exit(1);
// });
