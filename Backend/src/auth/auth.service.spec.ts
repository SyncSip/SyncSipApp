jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('src/dto/create-user.dto', () => ({
  CreateUserDto: class CreateUserDto {
    email: string;
    name: string;
    password: string;
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    finOne: jest.fn(),
    findByMail: jest.fn(),
    updateRefreshToken: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Mock environment variables
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if validation is successful', async () => {
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
      };
      
      mockUsersService.finOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual({
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
      });
      expect(mockUsersService.finOne).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed-password');
    });

    it('should return null if user not found', async () => {
      mockUsersService.finOne.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password');

      expect(result).toBeNull();
      expect(mockUsersService.finOne).toHaveBeenCalledWith('nonexistent@example.com');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null if password is incorrect', async () => {
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
      };
      
      mockUsersService.finOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrong-password');

      expect(result).toBeNull();
      expect(mockUsersService.finOne).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong-password', 'hashed-password');
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const userId = 'user-id';
      const email = 'test@example.com';
      
      mockJwtService.signAsync.mockResolvedValueOnce('mock-access-token');
      mockJwtService.signAsync.mockResolvedValueOnce('mock-refresh-token');

      const result = await service.generateTokens(userId, email);

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
      
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        { sub: userId, email },
        { secret: 'test-jwt-secret', expiresIn: '24h' }
      );
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        { sub: userId, email },
        { secret: 'test-jwt-refresh-secret', expiresIn: '365d' }
      );
    });
  });

  describe('login', () => {
    it('should return tokens if login is successful', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
      };
      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };
      
      mockUsersService.findByMail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(service, 'generateTokens').mockResolvedValue(mockTokens);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh-token');
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.login('test@example.com', 'password');

      expect(result).toEqual(mockTokens);
      expect(mockUsersService.findByMail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed-password');
      expect(service.generateTokens).toHaveBeenCalledWith('user-id', 'test@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('mock-refresh-token', 10);
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith({
        id: 'user-id',
        refreshToken: 'hashed-refresh-token',
      });
    });

    it('should return null if user not found', async () => {
      mockUsersService.findByMail.mockResolvedValue(null);

      const result = await service.login('nonexistent@example.com', 'password');

      expect(result).toBeNull();
      expect(mockUsersService.findByMail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null if password is incorrect', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
      };
      
      mockUsersService.findByMail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.login('test@example.com', 'wrong-password');

      expect(result).toBeNull();
      expect(mockUsersService.findByMail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong-password', 'hashed-password');
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens if refresh token is valid', async () => {
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        refreshToken: 'hashed-refresh-token',
      };
      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };
      
      mockUsersService.finOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(service, 'generateTokens').mockResolvedValue(mockTokens);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-refresh-token');
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.refreshTokens('user-id', 'old-refresh-token');

      expect(result).toEqual(mockTokens);
      expect(mockUsersService.finOne).toHaveBeenCalledWith('user-id');
      expect(bcrypt.compare).toHaveBeenCalledWith('old-refresh-token', 'hashed-refresh-token');
      expect(service.generateTokens).toHaveBeenCalledWith('user-id', 'Test User');
      expect(bcrypt.hash).toHaveBeenCalledWith('new-refresh-token', 10);
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith({
        id: 'user-id',
        refreshToken: 'new-hashed-refresh-token',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.finOne.mockResolvedValue(null);

      await expect(service.refreshTokens('nonexistent-id', 'refresh-token'))
        .rejects.toThrow(UnauthorizedException);
      
      expect(mockUsersService.finOne).toHaveBeenCalledWith('nonexistent-id');
    });

    it('should throw UnauthorizedException if user has no refresh token', async () => {
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        refreshToken: null,
      };
      
      mockUsersService.finOne.mockResolvedValue(mockUser);

      await expect(service.refreshTokens('user-id', 'refresh-token'))
        .rejects.toThrow(UnauthorizedException);
      
      expect(mockUsersService.finOne).toHaveBeenCalledWith('user-id');
    });

    it('should throw UnauthorizedException if refresh token does not match', async () => {
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        refreshToken: 'hashed-refresh-token',
      };
      
      mockUsersService.finOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refreshTokens('user-id', 'invalid-refresh-token'))
        .rejects.toThrow(UnauthorizedException);
      
      expect(mockUsersService.finOne).toHaveBeenCalledWith('user-id');
      expect(bcrypt.compare).toHaveBeenCalledWith('invalid-refresh-token', 'hashed-refresh-token');
    });
  });

  describe('logout', () => {
    it('should clear refresh token', async () => {
      mockUsersService.updateRefreshToken.mockResolvedValue({ affected: 1 });

      const result = await service.logout('user-id');

      expect(result).toEqual({ affected: 1 });
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith({
        id: 'user-id',
        refreshToken: null,
      });
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        name: 'New User',
        password: 'password',
      };
      
      mockUsersService.findByMail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        id: 'new-user-id',
        ...createUserDto,
      });

      const result = await service.register(createUserDto);

      expect(result).toBe(200);
      expect(mockUsersService.findByMail).toHaveBeenCalledWith('new@example.com');
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw BadRequestException if email is already registered', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        name: 'New User',
        password: 'password',
      };
      
      mockUsersService.findByMail.mockResolvedValue({
        id: 'existing-user-id',
        email: 'existing@example.com',
      });

      await expect(service.register(createUserDto))
        .rejects.toThrow(BadRequestException);
      
      expect(mockUsersService.findByMail).toHaveBeenCalledWith('existing@example.com');
      expect(mockUsersService.create).not.toHaveBeenCalled();
    });
  });
});
