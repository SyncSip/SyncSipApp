import { Module } from '@nestjs/common';
import { BeansService } from './beans.service';

@Module({
  providers: [BeansService]
})
export class BeansModule {}
