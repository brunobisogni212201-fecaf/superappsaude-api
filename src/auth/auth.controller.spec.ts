import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';
import { Response } from 'express';

const mockUser = {
  id: 'user-uuid-123',
  email: 'paciente@saude.com',
  name: 'João Silva',
  role: Role.PATIENT,
};

const mockAuthService = {
  validateFirebaseUser: jest.fn(),
  login: jest.fn(),
};

const mockResponse = {
  cookie: jest.fn(),
  clearCookie: jest.fn(),
} as unknown as Response;

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{ ttl: 300000, limit: 5 }]),
      ],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('POST /auth/login — plataforma web', () => {
    it('define cookie httpOnly e retorna dados do usuário', async () => {
      const fullUser = { ...mockUser, firebaseUid: 'uid', createdAt: new Date(), updatedAt: new Date(), professionalId: null };
      mockAuthService.validateFirebaseUser.mockResolvedValue(fullUser);
      mockAuthService.login.mockResolvedValue({
        access_token: 'jwt.token.aqui',
        user: mockUser,
      });

      const result = await controller.login('firebase-token', 'web', mockResponse);

      expect(mockAuthService.validateFirebaseUser).toHaveBeenCalledWith('firebase-token');
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'jwt.token.aqui',
        expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
      );
      expect(result).toEqual({ user: mockUser });
    });
  });

  describe('POST /auth/login — plataforma mobile', () => {
    it('retorna access_token no body (sem cookie)', async () => {
      const fullUser = { ...mockUser, firebaseUid: 'uid', createdAt: new Date(), updatedAt: new Date(), professionalId: null };
      mockAuthService.validateFirebaseUser.mockResolvedValue(fullUser);
      mockAuthService.login.mockResolvedValue({
        access_token: 'jwt.token.aqui',
        user: mockUser,
      });

      const result = await controller.login('firebase-token', 'mobile', mockResponse);

      expect(mockResponse.cookie).not.toHaveBeenCalled();
      expect(result).toEqual({
        access_token: 'jwt.token.aqui',
        user: mockUser,
      });
    });
  });

  describe('POST /auth/login — erros', () => {
    it('lança UnauthorizedException quando idToken não é fornecido', async () => {
      await expect(controller.login(undefined as any, 'web', mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.validateFirebaseUser).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/logout', () => {
    it('limpa o cookie e retorna mensagem de sucesso', async () => {
      const result = await controller.logout(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
