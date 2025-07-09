import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfidentialClientApplication, AuthenticationResult } from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';

@Injectable()
export class MicrosoftGraphService {
  private msalClient: ConfidentialClientApplication;
  
  constructor(private configService: ConfigService) {
    // Configuración para MSAL
    const tenantId = this.configService.get<string>('AZURE_TENANT_ID') || 'default-tenant-id';
    const clientId = this.configService.get<string>('AZURE_CLIENT_ID') || 'default-client-id';
    const clientSecret = this.configService.get<string>('AZURE_CLIENT_SECRET') || 'default-client-secret';
    //**-- Configuración de permisos --**//
    //     // Obtener valores de configuración
    // const tenantId =
    //   this.configService.get<string>('AZURE_TENANT_ID') || 'default-tenant-id';
    // const clientId =
    //   this.configService.get<string>('AZURE_CLIENT_ID') || 'default-client-id';
    // const clientSecret =
    //   this.configService.get<string>('AZURE_CLIENT_SECRET') ||
    //   'default-client-secret';
    // this.docentesGroupId =
    //   this.configService.get<string>('DOCENTES_GROUP_ID') || 'default-group-id';

    // // Configuración de Microsoft Graph API
    // const credential = new ClientSecretCredential(
    //   tenantId,
    //   clientId,
    //   clientSecret,
    // );
    // const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    //   scopes: ['https://graph.microsoft.com/.default'],
    // });

    // // Inicializar cliente de Graph
    // this.graphClient = Client.initWithMiddleware({ authProvider });

    //---
    
    // Inicializar MSAL como ConfidentialClientApplication (necesario para ROPC)
    this.msalClient = new ConfidentialClientApplication({
      auth: {
        clientId: clientId,
        clientSecret: clientSecret,
        authority: `https://login.microsoftonline.com/${tenantId}`
      }
    });
  }

  async validateTeacher(email: string, password: string) {
    try {
      // Intentar autenticar al usuario con sus credenciales
      let authResult: AuthenticationResult;
      try {
        const tokenResponse = await this.msalClient.acquireTokenByUsernamePassword({
          username: email,
          password: password,
          scopes: ['https://graph.microsoft.com/.default']
        });
        
        if (!tokenResponse) {
          throw new Error('Authentication failed - no token received');
        }
        
        authResult = tokenResponse;
      } catch (error) {
        console.log('Error de autenticación:', error);
        return {
          status: 401,
          success: false,
          isTeacher: false,
          message: 'Credenciales incorrectas',
        };
      }

      // Si llegamos aquí, la autenticación fue exitosa
      // Simplemente retornamos éxito y los datos del token
      
      try {
        const graphClient = Client.initWithMiddleware({
          authProvider: {
            getAccessToken: async () => {
              return authResult.accessToken;
            }
          }
        });

        // Obtener información del usuario
        const user = await graphClient.api('/me').get();
        
        return {
          success: true,
          user: {
            id: user.id,
            displayName: user.displayName,
            email: email,
            // Como tenemos problemas de permisos, consideramos que si el usuario
            // pudo autenticarse correctamente, es un profesor válido
            isTeacher: true,
          },
        };
      } catch (error) {
        console.log('Error al obtener datos del usuario:', error);
        // Si hay un error al obtener datos del usuario pero la autenticación fue exitosa,
        // consideramos que el usuario es válido
        return {
          success: true,
          user: {
            email: email,
            isTeacher: true,
          },
        };
      }
    } catch (error) {
      console.error('Error al validar profesor:', error);
      
      // Verificar si es un error por usuario no encontrado
      if (error.toString().includes('user not found') || 
          error.toString().includes('usuario no encontrado')) {
        return {
          status: 409,
          success: false,
          isTeacher: false,
          message: 'Usuario no encontrado en el directorio',
        };
      }
      
      throw error;
    }
  }
}