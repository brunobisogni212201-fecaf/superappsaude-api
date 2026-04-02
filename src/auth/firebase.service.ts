import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  onModuleInit() {
    if (admin.apps.length > 0) return;

    // Prioridade 1: Carregar serviceAccountKey.json se presente (ambiente local/dev)
    const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccount.json');
    if (fs.existsSync(serviceAccountPath)) {
      try {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id || 'saude-app-cd93e',
        });
        this.logger.log('Firebase Admin: Inicializado via serviceAccount.json');
        return;
      } catch (err) {
        this.logger.error('Erro ao ler serviceAccount.json:', err);
      }
    }

    // Prioridade 2: Cloud Run / Produção (Application Default Credentials)
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID || 'saude-app-cd93e',
      });
      this.logger.log('Firebase Admin: Inicializado via ADC (Cloud Run)');
    } catch (err) {
      this.logger.warn('Aviso: Firebase inicializado sem credenciais explícitas (pode falhar em chamadas autenticadas).');
    }
  }

  async verifyIdToken(idToken: string) {
    return admin.auth().verifyIdToken(idToken);
  }

  /**
   * Gera um link de login (Magic Link) para enviar por e-mail.
   * Útil para o fluxo de "Passwordless Authentication".
   */
  async generateMagicLink(email: string, platform: 'web' | 'mobile', baseUrl?: string) {
    // Prioriza a URL passada (dinâmica via Request), depois env, depois localhost
    const finalBaseUrl = baseUrl || process.env.API_URL || 'http://localhost:3000';
    
    const actionCodeSettings: admin.auth.ActionCodeSettings = {
      // A URL dinâmica capturada no momento da requisição
      url: `${finalBaseUrl}/auth/confirm?email=${email}&platform=${platform}`,
      handleCodeInApp: true,
      android: {
        packageName: 'com.saude.app.android',
        installApp: true,
        minimumVersion: '1',
      },
    };

    try {
      const link = await admin.auth().generateSignInWithEmailLink(email, actionCodeSettings);
      this.logger.log(`Magic Link gerado (URL: ${finalBaseUrl})`);
      return link;
    } catch (error) {
      this.logger.error(`Erro ao gerar Magic Link para ${email}:`, error);
      throw error;
    }
  }
}
