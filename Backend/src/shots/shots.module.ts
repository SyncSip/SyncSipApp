import { Module } from '@nestjs/common';
import { ShotsService } from './shots.service';
import { ShotsController } from './shots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shot } from 'src/data/entities/shot.entity/shot.entity';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/data/database.module';

@Module({
  imports: [TypeOrmModule.forFeature([Shot]), DatabaseModule, ConfigModule],
  providers: [ShotsService],
  controllers: [ShotsController],
  exports: [ShotsService],
})
export class ShotsModule {}
