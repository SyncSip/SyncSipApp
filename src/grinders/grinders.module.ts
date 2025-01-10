import { Module } from '@nestjs/common';
import { GrindersService } from './grinders.service';
import { GrindersController } from './grinders.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'src/data/database.module';
import { Shot } from 'src/data/entities/shot.entity/shot.entity';
import { Grinder } from 'src/data/entities/grinder.entity/grinder.entity';
import { MachinesService } from 'src/machines/machines.service';

@Module({
  imports: [TypeOrmModule.forFeature([Grinder, Shot]), DatabaseModule, ConfigModule],
  providers: [GrindersService],
  controllers: [GrindersController],
  exports: [GrindersService]
})
export class GrindersModule {}
