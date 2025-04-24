import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { RefreshDto } from 'src/dto/user-response.dto';
import { LocalStrategy } from './local.strategy';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    refreshTokens: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  };

  // Mock request object
  const mockRequest = {
    user: {
      id: 'user-id',
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: LocalStrategy,
          useValue: {}, // Mock LocalStrategy
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with correct credentials and return tokens', async () => {
      const loginDto = {
        username: 'test@example.com',
        password: 'password123',
      };

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      mockAuthService.login.mockResolvedValue(mockTokens);

      const result = await controller.login(loginDto, mockRequest);

      expect(result).toEqual(mockTokens);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginDto.username,
        loginDto.password,
      );
    });

    it('should handle login failure', async () => {
      const loginDto = {
        username: 'test@example.com',
        password: 'wrong-password',
      };

      mockAuthService.login.mockResolvedValue(null);

      const result = await controller.login(loginDto, mockRequest);

      expect(result).toBeNull();
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginDto.username,
        loginDto.password,
      );
    });

    it('should propagate errors from service', async () => {
      const loginDto = {
        username: 'test@example.com',
        password: 'password123',
      };

      const error = new Error('Login failed');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto, mockRequest)).rejects.toThrow(error);
    });
  });

  describe('refreshTokens', () => {
    it('should call authService.refreshTokens with correct parameters and return new tokens', async () => {
      const refreshDto: RefreshDto = {
        id: 'user-id',
        refreshToken: 'old-refresh-token',
      };

      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockAuthService.refreshTokens.mockResolvedValue(mockTokens);

      const result = await controller.refreshTokens(refreshDto);

      expect(result).toEqual(mockTokens);
      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        refreshDto.id,
        refreshDto.refreshToken,
      );
    });

    it('should propagate unauthorized exception', async () => {
      const refreshDto: RefreshDto = {
        id: 'user-id',
        refreshToken: 'invalid-refresh-token',
      };

      const error = new UnauthorizedException('Access Denied');
      mockAuthService.refreshTokens.mockRejectedValue(error);

      await expect(controller.refreshTokens(refreshDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should call authService.logout with correct user id and return success message', async () => {
      const refreshDto: RefreshDto = {
        id: 'user-id',
        refreshToken: 'refresh-token',
      };

      mockAuthService.logout.mockResolvedValue({ affected: 1 });

      const result = await controller.logout(refreshDto);

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(mockAuthService.logout).toHaveBeenCalledWith(refreshDto.id);
    });

    it('should propagate errors from service', async () => {
      const refreshDto: RefreshDto = {
        id: 'user-id',
        refreshToken: 'refresh-token',
      };

      const error = new Error('Logout failed');
      mockAuthService.logout.mockRejectedValue(error);

      await expect(controller.logout(refreshDto)).rejects.toThrow(error);
    });
  });

  describe('register', () => {
    it('should call authService.register with correct user data and return success code', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        name: 'New User',
        password: 'password123',
      };

      mockAuthService.register.mockResolvedValue(200);

      const result = await controller.register(createUserDto);

      expect(result).toBe(200);
      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
    });

    it('should propagate errors from service', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        name: 'New User',
        password: 'password123',
      };

      const error = new Error('Registration failed');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(createUserDto)).rejects.toThrow(error);
    });
  });
});
