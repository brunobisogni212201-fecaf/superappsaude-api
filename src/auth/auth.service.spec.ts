import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';
import { UsersService } from '../users/users.service';
import { Role } from '@prisma/client';

const mockUser = {
  id: 'user-uuid-123',
  firebaseUid: 'firebase-uid-abc',
  email: 'paciente@saude.com',
  name: 'João Silva',
  role: Role.PATIENT,
  createdAt: new Date(),
  updatedAt: new Date(),
  professionalId: null,
};

const mockFirebaseService = {
  verifyIdToken: jest.fn(),
};

const mockUsersService = {
  findByFirebaseUid: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mocked.jwt.token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: FirebaseService, useValue: mockFirebaseService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('validateFirebaseUser', () => {
    it('retorna usuário existente quando Firebase token é válido', async () => {
      mockFirebaseService.verifyIdToken.mockResolvedValue({
        uid: 'firebase-uid-abc',
        email: 'paciente@saude.com',
        name: 'João Silva',
      });
      mockUsersService.findByFirebaseUid.mockResolvedValue(mockUser);

      const result = await service.validateFirebaseUser('valid-firebase-token');

      expect(mockFirebaseService.verifyIdToken).toHaveBeenCalledWith('valid-firebase-token');
      expect(mockUsersService.findByFirebaseUid).toHaveBeenCalledWith('firebase-uid-abc');
      expect(mockUsersService.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('cria novo usuário automaticamente no primeiro login', async () => {
      mockFirebaseService.verifyIdToken.mockResolvedValue({
        uid: 'novo-uid',
        email: 'novo@saude.com',
        name: 'Maria Nova',
      });
      mockUsersService.findByFirebaseUid.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        ...mockUser,
        firebaseUid: 'novo-uid',
        email: 'novo@saude.com',
        name: 'Maria Nova',
      });

      const result = await service.validateFirebaseUser('valid-token-new-user');

      expect(mockUsersService.create).toHaveBeenCalledWith({
        firebaseUid: 'novo-uid',
        email: 'novo@saude.com',
        name: 'Maria Nova',
        role: Role.PATIENT,
      });
      expect(result.email).toBe('novo@saude.com');
    });

    it('usa email vazio e nome "User" quando Firebase não retorna esses campos', async () => {
      mockFirebaseService.verifyIdToken.mockResolvedValue({ uid: 'uid-sem-dados' });
      mockUsersService.findByFirebaseUid.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ ...mockUser });

      await service.validateFirebaseUser('token-sem-nome-email');

      expect(mockUsersService.create).toHaveBeenCalledWith({
        firebaseUid: 'uid-sem-dados',
        email: '',
        name: 'User',
        role: Role.PATIENT,
      });
    });

    it('lança UnauthorizedException quando Firebase token é inválido', async () => {
      mockFirebaseService.verifyIdToken.mockRejectedValue(new Error('Token inválido'));

      await expect(service.validateFirebaseUser('token-invalido')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('retorna access_token e dados do usuário', async () => {
      const result = await service.login(mockUser);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toEqual({
        access_token: 'mocked.jwt.token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
      });
    });
  });
});
