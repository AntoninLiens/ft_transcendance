import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
// import * as fs from 'fs';

async function bootstrap() {
	// const httpsOptions = {
	// 	key: fs.readFileSync("../ssl/key.pem"),
	// 	cert: fs.readFileSync("../ssl/cert.pem"),
	// }

	const app: NestExpressApplication = await NestFactory.create(AppModule);

	app.useGlobalPipes(new ValidationPipe());

	app.enableCors({
		origin: true,
		credentials: true,
	});

	app.useStaticAssets(join(__dirname, '..', 'uploads'), {
		index: false,
		prefix: '/uploads'
	});

	await app.listen(process.env.PORT);
}
bootstrap();
