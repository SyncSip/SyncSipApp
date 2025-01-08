import { Module } from '@nestjs/common';
import { GrindersService } from './grinders.service';

@Module({
  providers: [GrindersService]
})
export class GrindersModule {}
