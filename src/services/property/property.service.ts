import { prisma } from '@/lib/prisma';
import { AIParserService } from '../parsing';
import { PropertyScoringService } from './property-scoring.service';
import { WhatsAppService } from '../notifications';
import { MessageTemplatesService } from '../notifications';
import { ParsingResult } from '../../types/property';


/**
 * Serviço principal para processamento de imóveis
 * Integra parsing, scoring e notificação
 */
export class PropertyService {
  
  /**
   * Processa um imóvel completo: parsing + scoring + notificação
   */
  static async processProperty(propertyId: string): Promise<void> {
    try {
      console.log(`Iniciando processamento do imóvel: ${propertyId}`);
      
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: { createdBy: true }
      });

      if (!property) {
        throw new Error(`Property não encontrada: ${propertyId}`);
      }

      if (!property.createdBy?.phoneE164) {
        throw new Error('Usuário sem telefone para notificação');
      }

      await prisma.property.update({
        where: { id: propertyId },
        data: { 
          status: 'PENDING',
          lastParsedAt: new Date(),
          parseAttempts: { increment: 1 }
        }
      });

      const parsingResult = await AIParserService.parse(property.sourceUrl);
      
      if (!parsingResult.success || !parsingResult.property) {
        await this.handleParsingError(propertyId, parsingResult.error || 'Erro desconhecido');
        return;
      }

      const score = PropertyScoringService.calculateScore(parsingResult.property);
      
      const updatedProperty = await prisma.property.update({
        where: { id: propertyId },
        data: {
          title: parsingResult.property.title,
          price: parsingResult.property.price,
          m2: parsingResult.property.m2,
          condo: parsingResult.property.condo,
          iptu: parsingResult.property.iptu,
          rooms: parsingResult.property.rooms,
          parking: parsingResult.property.parking,
          neigh: parsingResult.property.neigh,
          city: parsingResult.property.city,
          state: parsingResult.property.state,
          zipCode: parsingResult.property.zipCode,
          photos: parsingResult.property.photos,
          score: score.score,
          scoreReasons: score.reasons,
          status: 'ACTIVE',
          lastParsedAt: new Date()
        }
      });

      await prisma.event.create({
        data: {
          userId: property.createdByUserId!,
          type: 'parse_completed',
          payload: {
            propertyId: propertyId,
            score: score.score,
            reasons: score.reasons,
            parser: parsingResult.property.parser,
            hasPhotos: !!(parsingResult.property.photos && parsingResult.property.photos.length > 0)
          }
        }
      });


      await this.sendParsingNotification(
        property.createdBy.phoneE164,
        score.score,
        score.reasons,
        propertyId
      );

      console.log(`Imóvel processado com sucesso: ${propertyId}, Score: ${score.score}`);

    } catch (error) {
      console.error('Erro no processamento do imóvel:', error);
      await this.handleParsingError(propertyId, error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }

  /**
   * Envia notificação de parsing concluído
   */
  private static async sendParsingNotification(
    phoneE164: string,
    score: number,
    reasons: string[],
    propertyId: string
  ): Promise<void> {
    try {
      const appUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/property/${propertyId}`;
      const message = MessageTemplatesService.parsingCompleted(score, reasons, appUrl);
      
      // Garantir que o número esteja no formato correto para Evolution API
      // O número deve estar no formato: 5562993234763 (com código do país)
      let formattedNumber = phoneE164;
      
      // Se não começar com 55 (Brasil), adicionar
      if (!formattedNumber.startsWith('55')) {
        formattedNumber = '55' + formattedNumber;
      }
      
      // Adicionar sufixo @s.whatsapp.net
      formattedNumber = `${formattedNumber}@s.whatsapp.net`;

      await WhatsAppService.sendMessage(formattedNumber, message);
      
      console.log(`Notificação enviada para ${phoneE164}: Score ${score}`);

    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      
      await prisma.event.create({
        data: {
          type: 'notification_error',
          payload: {
            phoneE164,
            propertyId,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          }
        }
      });
    }
  }

  /**
   * Trata erros de parsing
   */
  private static async handleParsingError(propertyId: string, error: string): Promise<void> {
    try {
      await prisma.property.update({
        where: { id: propertyId },
        data: {
          status: 'INACTIVE',
          parseErrors: { 
            lastError: error,
            timestamp: new Date().toISOString()
          }
        }
      });

      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: { createdBy: true }
      });

      if (property?.createdByUserId) {
        await prisma.event.create({
          data: {
            userId: property.createdByUserId,
            type: 'parse_error',
            payload: {
              propertyId,
              error,
              sourceUrl: property.sourceUrl
            }
          }
        });
      }

      console.log(`Erro de parsing registrado para ${propertyId}: ${error}`);

    } catch (logError) {
      console.error('Erro ao registrar erro de parsing:', logError);
    }
  }

  /**
   * Processa imóveis pendentes em lote
   */
  static async processPendingProperties(limit: number = 10): Promise<void> {
    try {
      const pendingProperties = await prisma.property.findMany({
        where: { 
          status: 'PENDING',
          parseAttempts: { lt: 3 }
        },
        take: limit,
        orderBy: { createdAt: 'asc' }
      });

      console.log(`Processando ${pendingProperties.length} imóveis pendentes`);

      for (const property of pendingProperties) {
        await this.processProperty(property.id);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.error('Erro no processamento em lote:', error);
    }
  }
}
