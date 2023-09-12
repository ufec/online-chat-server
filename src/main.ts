import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import fastifyHelmet from '@fastify/helmet';
import fastifyCompress from '@fastify/compress';
import fastifyMultipart from '@fastify/multipart';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  type FastifyAdapterParameters = Parameters<typeof app.register>;
  type FastifyAdapterRegister = FastifyAdapterParameters[0];
  await app.register(fastifyHelmet as unknown as FastifyAdapterRegister);
  await app.register(fastifyCompress as unknown as FastifyAdapterRegister);
  await app.register(fastifyMultipart as unknown as FastifyAdapterRegister, {
    limits: {
      files: 1,
      fileSize: 1024 * 1024 * 10, // 10M
    },
  });
  // 静态资源 允许跨域访问
  app.useStaticAssets({
    root: process.cwd() + '/uploads',
    prefix: '/uploads',
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
  });
  // if you not use bind, you will get error Avoid referencing unbound methods which may cause unintentional scoping of `this`. If your function does not access `this`, you can annotate it with `this: void`, or consider using an arrow function instead.
  app.use(new LoggerMiddleware().use.bind(app)); // 日志
  // 全局参数校验
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      enableDebugMessages: process.env.NODE_ENV === 'development', // 开发环境下显示详细错误信息
    })
  );
  app.useGlobalInterceptors(new TransformInterceptor()); // 全局异常拦截器
  app.useGlobalFilters(new HttpExceptionFilter()); // 全局异常过滤器
  const config = app.get(ConfigService);
  const prefix = config.get<string>('app.prefix') ?? '/';
  app.setGlobalPrefix(prefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  const swaggerOptions = new DocumentBuilder()
    .setTitle('Online-Chat Api Document')
    .setDescription('The Online-Chat Api Document')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup(`${prefix}docs`, app, document, {
    customSiteTitle: 'Online-Chat Api Document',
  });
  await app.listen(config.get<number>('app.port') ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().catch((err) => {
  console.error(err);
});
