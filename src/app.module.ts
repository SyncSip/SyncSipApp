import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ShotsModule } from './shots/shots.module';
import { MachinesModule } from './machines/machines.module';
import { GrindersModule } from './grinders/grinders.module';
import { BeansModule } from './beans/beans.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './data/entities/user.entity/user.entity';
import { Bean } from './data/entities/beans.entity/beans.entity';
import { Grinder } from './data/entities/grinder.entity/grinder.entity';
import { Machine } from './data/entities/machine.entity/machine.entity';
import { Shot } from './data/entities/shot.entity/shot.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { databaseConfig, serverConfig } from './config/configuration';
import { DatabaseModule } from './data/database.module';

@Module({
  imports: [
    AuthModule,
    ShotsModule,
    MachinesModule,
    GrindersModule,
    BeansModule,
    UsersModule,
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        DatabaseModule,
      ],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [User, Shot, Machine, Grinder, Bean],
        synchronize: configService.get('server.nodeEnv') === 'development',
        logging: configService.get('server.nodeEnv') === 'development',
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, serverConfig],
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
