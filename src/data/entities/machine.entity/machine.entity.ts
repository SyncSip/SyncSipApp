import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Shot } from '../shot.entity/shot.entity';
import { User } from '../user.entity/user.entity';

@Entity('machines')
export class Machine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  brandName: string;

  @Column()
  model: string;

  @Column('uuid')
  userId: string

  @ManyToOne(() => User)
  @JoinColumn({name: 'userId'})
  user: User

  @OneToMany(() => Shot, (shot) => shot.machine)
  shots: Shot[];
}
