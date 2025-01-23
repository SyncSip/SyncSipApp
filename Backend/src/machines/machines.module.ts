import { Module } from '@nestjs/common';
import { MachinesService } from './machines.service';
import { MachinesController } from './machines.controller';
import { Machine } from 'src/data/entities/machine.entity/machine.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/data/database.module';
import { Shot } from 'src/data/entities/shot.entity/shot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Machine, Shot]), DatabaseModule, ConfigModule],
  providers: [MachinesService],
  controllers: [MachinesController],
  exports: [MachinesService]
})
export class MachinesModule {}
