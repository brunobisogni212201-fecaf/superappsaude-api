import { Controller, Post, Body, Res, UnauthorizedException, Req, UseGuards, Get, Query } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LoginDto, MagicLinkDto } from './dto/auth.dto';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateFirebaseUser(loginDto.idToken);
    const { access_token, user: userData } = await this.authService.login(user);

    if (loginDto.platform === 'web') {
      response.cookie('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600000, // 1 hour
      });

      return { user: userData };
    }

    return { access_token, user: userData };
  }

  @Post('magic-link')
  async sendMagicLink(
    @Req() req: Request,
    @Body() magicLinkDto: MagicLinkDto,
  ) {
    // Captura a URL base dinamicamente (ex: https://api-saude.a.run.app)
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const link = await this.authService.sendMagicLink(magicLinkDto.email, magicLinkDto.platform, baseUrl);
    return { message: 'Link de login gerado com sucesso', link };
  }

  @Get('confirm')
  async confirmMagicLink(
    @Query('email') email: string,
    @Query('platform') platform: 'web' | 'mobile',
    @Res() res: Response,
  ) {
    const webUrl = process.env.WEB_URL || 'https://saude-app-cd93e.web.app';
    
    if (platform === 'mobile') {
      // Redireciona para o esquema customizado do App Android para abrir o app diretamente
      // O app deve estar configurado para ouvir saudeapp://
      return res.redirect(`saudeapp://confirm?email=${email}`);
    }

    // Para Web, redireciona para a página de confirmação do Dashboard
    return res.redirect(`${webUrl}/login-confirm?email=${email}`);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }
}
