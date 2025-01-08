import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ShotsModule } from './shots/shots.module';
import { MachinesModule } from './machines/machines.module';
import { GrindersModule } from './grinders/grinders.module';
import { BeansModule } from './beans/beans.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, ShotsModule, MachinesModule, GrindersModule, BeansModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
