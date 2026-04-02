import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from './firebase.service';
import { UsersService } from '../users/users.service';
import { User, Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private firebaseService: FirebaseService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateFirebaseUser(idToken: string): Promise<User> {
    try {
      const decodedToken = await this.firebaseService.verifyIdToken(idToken);
      const { uid, email, name } = decodedToken;

      let user = await this.usersService.findByFirebaseUid(uid);

      if (!user) {
        user = await this.usersService.create({
          firebaseUid: uid,
          email: email || '',
          name: name || 'User',
          role: Role.PATIENT, // Default role
        });
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
  }

  async register(idToken: string, name: string) {
    try {
      const decodedToken = await this.firebaseService.verifyIdToken(idToken);
      const { uid, email } = decodedToken;

      let user = await this.usersService.findByFirebaseUid(uid);

      if (!user) {
        user = await this.usersService.create({
          firebaseUid: uid,
          email: email || '',
          name: name,
          role: Role.PATIENT, // Default role
          onboardingCompleted: false,
        });
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Erro ao processar cadastro');
    }
  }

  async login(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async sendMagicLink(email: string, platform: 'web' | 'mobile', baseUrl?: string) {
    return this.firebaseService.generateMagicLink(email, platform, baseUrl);
  }
}
