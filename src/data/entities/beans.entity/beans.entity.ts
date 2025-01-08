import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Shot } from '../shot.entity/shot.entity';

@Entity('beans')
export class Bean {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  roastery: string;

  @Column()
  bean: string;

  @OneToMany(() => Shot, shot => shot.beans)
  shots: Shot[];
}
