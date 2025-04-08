import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user.entity/user.entity';
import { Machine } from '../machine.entity/machine.entity';
import { Grinder } from '../grinder.entity/grinder.entity';
import { Bean } from '../beans.entity/beans.entity';

export interface CustomField {
  key: string;
  value: string;
}

@Entity('shots')
export class Shot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('float')
  time: number;

  @Column('float')
  weight: number;

  @Column('float')
  dose: number;

  @Column('uuid', { nullable: true })
  machineId: string;

  @Column('uuid', { nullable: true })
  grinderId: string;

  @Column('uuid', { nullable: true })
  beansId: string;

  @Column('jsonb', { nullable: true })
  graphData: any;

  @Column({ nullable: true })
  group: string;

  @Column({ default: false })
  starred: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column('jsonb', { nullable: true })
  customFields: CustomField[];

  @ManyToOne(() => User, (user) => user.shots)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Machine)
  @JoinColumn({ name: 'machineId' })
  machine: Machine;

  @ManyToOne(() => Grinder)
  @JoinColumn({ name: 'grinderId' })
  grinder: Grinder;

  @ManyToOne(() => Bean)
  @JoinColumn({ name: 'beansId' })
  beans: Bean;
}
