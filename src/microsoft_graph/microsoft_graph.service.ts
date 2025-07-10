import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfidentialClientApplication, AuthenticationResult } from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';

@Injectable()
export class MicrosoftGraphService {
  private msalClient: ConfidentialClientApplication;
    private graphClientApp: Client;
  constructor(private configService: ConfigService) {
    // Configuración para MSAL
    const tenantId = this.configService.get<string>('AZURE_TENANT_ID') || 'default-tenant-id';
    const clientId = this.configService.get<string>('AZURE_CLIENT_ID') || 'default-client-id';
    const clientSecret = this.configService.get<string>('AZURE_CLIENT_SECRET') || 'default-client-secret';
    
    // Inicializar MSAL como ConfidentialClientApplication (necesario para ROPC)
    this.msalClient = new ConfidentialClientApplication({
      auth: {
        clientId: clientId,
        clientSecret: clientSecret,
        authority: `https://login.microsoftonline.com/${tenantId}`
      }
    });

    // Inicializar cliente de Graph para llamadas a nivel de aplicación
    const credential = new ClientSecretCredential(
      tenantId,
      clientId,
      clientSecret
    );
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default'],
    });
    this.graphClientApp = Client.initWithMiddleware({ authProvider });
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
        
        // Verificar si el usuario pertenece al grupo de docentes
        const docentesGroupId = this.configService.get<string>('DOCENTES_GROUP_ID');
        
        let isTeacher = false;
        try {
          // Verificar membresía en el grupo
          const memberOf = await graphClient.api(`/users/${user.id}/memberOf`).get();
          isTeacher = memberOf.value.some(group => group.id === docentesGroupId);
          
          console.log(`Usuario ${email} es docente: ${isTeacher}`);
          
          // Si NO es docente, devolvemos estado 401 (no autorizado)
          if (!isTeacher) {
            return {
              status: 401,
              success: false,
              isTeacher: false,
              message: 'El usuario no es docente o no tiene permisos suficientes',
            };
          }
        } catch (groupError) {
          console.error('Error al verificar grupo:', groupError);
          // Si no podemos verificar el grupo, asumimos que no es docente
          isTeacher = false;
          return {
            status: 401,
            success: false,
            isTeacher: false,
            message: 'No se pudo verificar el estado de docente',
          };
        }
        
        // Solo llegamos aquí si es docente
        return {
          success: true,
          user: {
            id: user.id,
            displayName: user.displayName,
            email: email,
            isTeacher: true,
          },
        };
      } catch (error) {
        console.log('Error al obtener datos del usuario:', error);
        return {
          status: 401,
          success: false,
          isTeacher: false,
          message: 'No se pudo verificar el estado de docente',
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

  async validateTeacherByEmail(email: string) {
    try {
      // Buscar el usuario por su correo electrónico usando permisos de aplicación
      const users = await this.graphClientApp.api('/users')
        .filter(`mail eq '${email}' or userPrincipalName eq '${email}'`)
        .select('id,displayName,mail,userPrincipalName')
        .get();

      if (!users.value || users.value.length === 0) {
        return {
          status: 404,
          success: false,
          isTeacher: false,
          message: 'Usuario no encontrado en el directorio',
        };
      }

      const user = users.value[0];
      
      // Verificar si el usuario pertenece al grupo de docentes
      const docentesGroupId = this.configService.get<string>('DOCENTES_GROUP_ID');
      
      try {
        // USANDO EL MISMO MÉTODO QUE EN validateTeacher
        // Verificar membresía en el grupo usando la API de memberOf
        const memberOf = await this.graphClientApp.api(`/users/${user.id}/memberOf`).get();
        const isTeacher = memberOf.value.some(group => group.id === docentesGroupId);
        
        console.log(`Usuario ${email} es docente: ${isTeacher}`);
        
        if (!isTeacher) {
          return {
            status: 401,
            success: false,
            isTeacher: false,
            message: 'El usuario no es docente o no tiene permisos suficientes',
          };
        }
        
        // Si es docente
        return {
          success: true,
          user: {
            id: user.id,
            displayName: user.displayName,
            email: email,
            isTeacher: true,
          },
        };
        
      } catch (groupError) {
        console.error('Error al verificar grupo:', groupError);
        return {
          status: 401,
          success: false,
          isTeacher: false,
          message: 'No se pudo verificar el estado de docente',
        };
      }
    } catch (error) {
      console.error('Error al validar profesor por email:', error);
      throw error;
    }
  }
}