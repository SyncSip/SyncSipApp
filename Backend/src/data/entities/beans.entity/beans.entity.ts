import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CustomField, Shot } from '../shot.entity/shot.entity';
import { User } from '../user.entity/user.entity';

@Entity('beans')
export class Bean {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  roastery: string;

  @Column()
  bean: string;

  @Column({ nullable: true })
  altitudeInMeters: string;

  @Column({ nullable: true })
  roastDate: Date;

  @Column({ nullable: true })
  process: string;

  @Column({ nullable: true })
  genetic: string;

  @Column({ nullable: true })
  variety: string;

  @Column({ nullable: true })
  origin: string;

  @Column({ nullable: true })
  full: boolean;

  @Column('jsonb', { nullable: true })
  customFields: CustomField[];

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Shot, (shot) => shot.beans)
  shots: Shot[];
}
