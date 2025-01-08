import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Shot } from '../shot.entity/shot.entity';

@Entity('grinders')
export class Grinder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  brandName: string;

  @Column()
  model: string;

  @OneToMany(() => Shot, shot => shot.grinder)
  shots: Shot[];
}
