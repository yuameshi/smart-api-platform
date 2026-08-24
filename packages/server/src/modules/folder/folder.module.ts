import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from './entities/folder.entity';
import { ApiEndpoint } from '@/modules/endpoint/entities/api-endpoint.entity';
import { ProjectModule } from '@/modules/project/project.module';
import { FolderService } from './folder.service';
import { FolderController } from './folder.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Folder, ApiEndpoint]), ProjectModule],
	controllers: [FolderController],
	providers: [FolderService],
})
export class FolderModule {}
