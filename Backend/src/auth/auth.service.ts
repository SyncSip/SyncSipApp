import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt'

const mockUser = {
  id: '87r3280934234',
  name: 'snooducks',
};
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.finOne(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }


  async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '24h',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '365d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }


  async login(email: string, password: string) {
    console.log(email, password)
    const user = await this.usersService.findByMail(email)
    if(!user){
      return null
    }
    console.log("user found", user)
    if(await bcrypt.compare(password, user.password)){
      const tokens = await this.generateTokens(user.id, email);
      await this.usersService.updateRefreshToken({
        id: user.id,
        refreshToken: await bcrypt.hash(tokens.refreshToken, 10)
      }
      );
      console.log("tokens: ", tokens)
      return tokens;
    }
    console.log("lol")
    return null
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.finOne(userId);
    
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.generateTokens(user.id, user.name);
    
    await this.usersService.updateRefreshToken({
      id: user.id,
      refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
  });

    return tokens;
  }

  async logout(userId: string) {
    return await this.usersService.updateRefreshToken({id: userId, refreshToken: null});
  }

  async register(createUserDto: CreateUserDto){
    const user = await this.usersService.findByMail(createUserDto.email)
    if(user){
      console.log(user)
      throw new BadRequestException("This email is already registered")
    }
    const newUser = await this.usersService.create(createUserDto)
    if(newUser){
      return 200
    }
  }
}
