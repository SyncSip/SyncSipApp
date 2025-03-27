import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity/user.entity';
import { Shot } from './entities/shot.entity/shot.entity';
import { Machine } from './entities/machine.entity/machine.entity';
import { Grinder } from './entities/grinder.entity/grinder.entity';
import { Bean } from './entities/beans.entity/beans.entity';
import { DatabaseService } from './database.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, Shot, Machine, Grinder, Bean],
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule, DatabaseService],
  providers: [DatabaseService]

})
export class DatabaseModule {}
