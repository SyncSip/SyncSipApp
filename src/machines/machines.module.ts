import { Module } from '@nestjs/common';
import { MachinesService } from './machines.service';

@Module({
  providers: [MachinesService]
})
export class MachinesModule {}
