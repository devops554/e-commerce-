import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { MongoExceptionFilter } from './common/filters/mongo-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new MongoExceptionFilter());
  const origins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
    : ['http://localhost:3000'];

  app.enableCors({
    origin: origins,
    credentials: true,
  });
  // Health check — keeps Render alive
const httpAdapter = app.getHttpAdapter();
httpAdapter.get('/health', (req: any, res: any) => {
  res.status(200).json({ status: 'ok', message: 'Kiranase backend is alive' });
});

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
