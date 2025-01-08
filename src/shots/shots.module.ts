import { Module } from '@nestjs/common';
import { ShotsService } from './shots.service';

@Module({
  providers: [ShotsService]
})
export class ShotsModule {}
