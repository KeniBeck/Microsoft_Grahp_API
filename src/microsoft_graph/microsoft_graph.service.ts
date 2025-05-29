import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';

@Injectable()
export class MicrosoftGraphService {
  private graphClient: Client;
  private docentesGroupId: string;

  constructor(private configService: ConfigService) {
    // Obtener valores de configuración
    const tenantId = this.configService.get<string>('AZURE_TENANT_ID') || 'default-tenant-id';
    const clientId = this.configService.get<string>('AZURE_CLIENT_ID') || 'default-client-id';
    const clientSecret = this.configService.get<string>('AZURE_CLIENT_SECRET') || 'default-client-secret';
    this.docentesGroupId = this.configService.get<string>('DOCENTES_GROUP_ID') || 'default-group-id';

    // Configuración de Microsoft Graph API
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default']
    });

    // Inicializar cliente de Graph
    this.graphClient = Client.initWithMiddleware({ authProvider });
  }

  async validateTeacher(email: string) {
    try {
      console.log(`Validando profesor: ${email}`);
      
      // Obtener información del usuario por su email
      const userResponse = await this.graphClient
        .api(`/users`)
        .filter(`mail eq '${email}'`)
        .get();
      
      if (!userResponse.value || userResponse.value.length === 0) {
        console.log(`Usuario no encontrado: ${email}`);
        return { 
          success: false,
          isTeacher: false,
          message: 'Usuario no encontrado en el directorio'
        };
      }
      
      const user = userResponse.value[0];
      console.log(`Usuario encontrado: ${user.displayName} (${user.id})`);
      
      // Verificar si el usuario es miembro del grupo Docentes Ameritec
      const membershipResponse = await this.graphClient
        .api(`/groups/${this.docentesGroupId}/members`)
        .filter(`id eq '${user.id}'`)
        .get();
      
      // Si el usuario está en el grupo, es profesor
      const isTeacher = membershipResponse.value && membershipResponse.value.length > 0;
      
      console.log(`¿Es profesor? ${isTeacher ? 'SÍ' : 'NO'}`);
      
      return {
        success: true,
        user: {
          id: user.id,
          displayName: user.displayName,
          email: email,
          isTeacher: isTeacher
        }
      };
      
    } catch (error) {
      console.error('Error al validar profesor:', error);
      throw error;
    }
  }
}