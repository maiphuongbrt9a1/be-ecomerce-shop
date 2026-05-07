import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '@/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('@/helpers/utils', () => ({
  comparePasswordHelper: jest.fn(),
  hashPasswordHelper: jest.fn(),
  formatMediaField: jest.fn(),
  resolveUrl: jest.fn(),
  createPackageChecksum: jest.fn(),
  verifyPackageChecksum: jest.fn(),
}));

jest.mock('@/helpers/types/types', () => ({
  OrdersWithFullInformationInclude: {},
}));

import * as utils from '@/helpers/utils';

describe('AuthService', () => {
  let service: AuthService;
  let userService: { getUserByEmail: jest.Mock };
  let jwtService: { sign: jest.Mock };
  let prismaService: { user: { count: jest.Mock } };

  beforeEach(async () => {
    userService = { getUserByEmail: jest.fn() };
    jwtService = { sign: jest.fn() };
    prismaService = { user: { count: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    const mockUser = {
      id: 1,
      firstName: 'Sang',
      lastName: 'Truong',
      email: 'sang@test.com',
      password: '$2b$10$hashedpassword',
      role: 'USER',
      isActive: true,
    };

    it('should return user data when credentials are valid', async () => {
      userService.getUserByEmail.mockResolvedValue(mockUser);
      (utils.comparePasswordHelper as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('sang@test.com', 'password123');

      expect(result).toEqual({
        id: 1,
        firstName: 'Sang',
        lastName: 'Truong',
        name: 'Sang Truong',
        email: 'sang@test.com',
        role: 'USER',
        isActive: true,
      });
      expect(userService.getUserByEmail).toHaveBeenCalledWith('sang@test.com');
    });

    it('should throw UnauthorizedException when email not found', async () => {
      userService.getUserByEmail.mockResolvedValue(null);

      await expect(
        service.validateUser('notfound@test.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      userService.getUserByEmail.mockResolvedValue(mockUser);
      (utils.comparePasswordHelper as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('sang@test.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user has no password', async () => {
      userService.getUserByEmail.mockResolvedValue({
        ...mockUser,
        password: null,
      });

      await expect(
        service.validateUser('sang@test.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return user info and access_token', () => {
      const user = {
        id: 1,
        firstName: 'Sang',
        lastName: 'Truong',
        name: 'Sang Truong',
        email: 'sang@test.com',
        role: 'USER' as const,
        isActive: true,
      };
      jwtService.sign.mockReturnValue('jwt.token.here');

      const result = service.login(user);

      expect(result).toHaveProperty('access_token', 'jwt.token.here');
      expect(result.user).toMatchObject({
        id: 1,
        email: 'sang@test.com',
        role: 'USER',
      });
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 1,
          username: 'sang@test.com',
          role: 'USER',
        }),
      );
    });
  });

  describe('checkEmailExists', () => {
    it('should return true when email exists', async () => {
      prismaService.user.count.mockResolvedValue(1);
      expect(await service.checkEmailExists('sang@test.com')).toBe(true);
    });

    it('should return false when email does not exist', async () => {
      prismaService.user.count.mockResolvedValue(0);
      expect(await service.checkEmailExists('none@test.com')).toBe(false);
    });
  });
});
