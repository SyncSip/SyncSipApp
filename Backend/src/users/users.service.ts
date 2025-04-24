import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseService } from 'src/data/database.service';
import { User } from 'src/data/entities/user.entity/user.entity';
import {
  CreateUserDto,
  DeleteUserDto,
  EditUserDto,
} from 'src/dto/create-user.dto';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RefreshDto } from 'src/dto/user-response.dto';

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

  async findByMail(email: string) {
    return await this.userRepository.findOneBy({ email: email });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    createUserDto.password = hashedPassword;
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);
    return savedUser;
  }

  async updateRefreshToken(updateTokenDto: RefreshDto): Promise<any> {
    const user = await this.userRepository.findOneBy({ id: updateTokenDto.id });
    user.refreshToken = updateTokenDto.refreshToken;
    console.log(user);
    const saved = await this.userRepository.save(user);
    console.log(saved);
    return saved;
  }
}
