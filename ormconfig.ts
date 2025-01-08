import { DataSource } from 'typeorm';
import { User } from './src/data/entities/user.entity/user.entity';
import { Shot } from './src/data/entities/shot.entity/shot.entity';
import { Machine } from './src/data/entities/machine.entity/machine.entity';
import { Grinder } from './src/data/entities/grinder.entity/grinder.entity';
import { Bean } from './src/data/entities/beans.entity/beans.entity';
import {config} from 'dotenv'

config()

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, Shot, Machine, Grinder, Bean],
  migrations: ['src/data/migrations/*.ts'],
  synchronize: false,
  logging: true,
  extra: {
    max: 5,
    connectionTimeoutMillis: 10000,
  },
  connectTimeoutMS: 10000,
});

export default dataSource
