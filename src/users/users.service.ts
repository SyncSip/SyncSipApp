import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseService } from 'src/data/database.service';
import { User } from 'src/data/entities/user.entity/user.entity';
import { DeleteUserDto, EditUserDto } from 'src/dto/create-user.dto';
import { Repository } from 'typeorm';

const mockUser = {
  id: '87r3280934234',
  name: 'snooducks',
};
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
    private databaseService: DatabaseService,
  ) {}

  async finOne(id: string) {
    return this.userRepository.findOneBy({ id: id });
  }
  async edit(editUserDto: EditUserDto) {
    return mockUser;
  }

  async delete(deleteUserDto: DeleteUserDto) {
    return mockUser;
  }
}
