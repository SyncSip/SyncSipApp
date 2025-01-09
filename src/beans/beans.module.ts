import { Module } from '@nestjs/common';
import { BeansService } from './beans.service';
import { BeansController } from './beans.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'src/data/database.module';
import { Shot } from 'src/data/entities/shot.entity/shot.entity';
import { Bean } from 'src/data/entities/beans.entity/beans.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bean, Shot]), DatabaseModule, ConfigModule],
  providers: [BeansService],
  controllers: [BeansController],
})
export class BeansModule {}
