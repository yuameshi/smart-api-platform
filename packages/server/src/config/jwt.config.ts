import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
	if (!process.env.JWT_SECRET) throw new Error('JWT密钥未定义');
	return {
		algorithm: 'HS256',
		secret: process.env.JWT_SECRET,
		expiresIn: process.env.JWT_EXPIRES_IN || '7d',
	};
});
