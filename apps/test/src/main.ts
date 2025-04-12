import { NestFactory } from '@nestjs/core';
import { TestModule } from './test.module';

async function bootstrap() {
  const app = await NestFactory.create(TestModule);
  await app.listen(4040);
}
bootstrap().then(() => {
    console.log('Server running on port 4000');
})
