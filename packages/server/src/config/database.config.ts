import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
	type: 'mariadb',
	host: process.env.DB_HOST || '127.0.0.1',
	port: parseInt(process.env.DB_PORT || '3306', 10),
	username: process.env.DB_USERNAME || 'root',
	password: process.env.DB_PASSWORD || '',
	database: process.env.DB_DATABASE || 'smart_api_platform',
	autoLoadEntities: true,
	synchronize: true,
}));
