// import { NestFactory } from '@nestjs/core';
// import { AppModule } from '../app.module';
// import { ProductsService } from '../products/products.service';

// async function bootstrap() {
//     const app = await NestFactory.createApplicationContext(AppModule);
//     await app.init();
//     const productsService = app.get(ProductsService);

//     const rootCategoryId = '69a20a00502fce4f16977064';
//     console.log(`Calling productsService.findAll for root category: ${rootCategoryId}`);

//     const result = await productsService.findAll({
//         category: rootCategoryId,
//         limit: 20,
//         isActive: true
//     });

//     console.log('Result from Service:', result.total, 'products found.');

//     await app.close();
//     process.exit(0);
// }

// bootstrap();
