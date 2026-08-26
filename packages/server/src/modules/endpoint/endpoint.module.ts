import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiEndpoint } from './entities/api-endpoint.entity';
import { Folder } from '@/modules/folder/entities/folder.entity';
import { ProjectModule } from '@/modules/project/project.module';
import { EndpointService } from './endpoint.service';
import { EndpointController } from './endpoint.controller';

@Module({
	imports: [TypeOrmModule.forFeature([ApiEndpoint, Folder]), ProjectModule],
	controllers: [EndpointController],
	providers: [EndpointService],
})
export class EndpointModule {}
