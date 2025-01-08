import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Shot } from '../shot.entity/shot.entity';

@Entity('machines')
export class Machine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  brandName: string;

  @Column()
  model: string;

  @OneToMany(() => Shot, shot => shot.machine)
  shots: Shot[];
}
