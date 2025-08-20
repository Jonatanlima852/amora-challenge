'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Share2, MessageCircle, BarChart3, MapPin, Home, Car, Ruler } from 'lucide-react';
import { ParsedProperty } from '@/types/property';

interface PropertyCardProps {
  property: ParsedProperty;
  onCompare?: (property: ParsedProperty) => void;
  onFavorite?: (propertyId: string) => void;
  onComment?: (propertyId: string) => void;
  onPropertyClick?: (property: ParsedProperty) => void;
  isSelected?: boolean;
  showActions?: boolean;
}

export function PropertyCard({
  property,
  onCompare,
  onFavorite,
  onComment,
  onPropertyClick,
  isSelected = false,
  showActions = true
}: PropertyCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    onFavorite?.(property.id || '');
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Preço sob consulta';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatScore = (score?: number) => {
    if (!score) return 'N/A';
    return `${score}/100`;
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-500';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Gera uma imagem simples via canvas com CTA para compartilhamento
  const generateShareImage = async (): Promise<string> => {
    const width = 1080;
    const height = 1080;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas não suportado');

    // Fundo gradiente
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#2563eb');
    gradient.addColorStop(1, '#7c3aed');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Caixa branca
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    const pad = 60;
    ctx.fillRect(pad, pad, width - pad * 2, height - pad * 2);

    // Título
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 48px Inter, Arial, sans-serif';
    const title = property.title?.slice(0, 60) || 'Imóvel aMORA';
    ctx.fillText(title, pad + 40, pad + 120);

    // CTA
    ctx.font = '36px Inter, Arial, sans-serif';
    const cta = 'Gostei desse imóvel que encontrei através da aMORA. Dê uma olhada!';
    wrapText(ctx, cta, pad + 40, pad + 200, width - pad * 2 - 80, 48);

    // Preço e score
    ctx.font = 'bold 44px Inter, Arial, sans-serif';
    const priceStr = formatPrice(property.price);
    ctx.fillText(priceStr, pad + 40, height - pad - 140);
    ctx.font = 'bold 44px Inter, Arial, sans-serif';
    const scoreStr = `Índice aMORA: ${property.score ?? 'N/A'}`;
    ctx.fillText(scoreStr, pad + 40, height - pad - 80);

    // Marca
    ctx.font = 'bold 36px Inter, Arial, sans-serif';
    ctx.fillStyle = '#374151';
    ctx.fillText('amora.house', width - pad - 350, height - pad - 80);

    return canvas.toDataURL('image/png');
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  };

  const openSharePopup = (url: string, name: string) => {
    const w = 720;
    const h = 720;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    window.open(url, name, `width=${w},height=${h},left=${left},top=${top}`);
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const dataUrl = await generateShareImage();
      const blob = await (await fetch(dataUrl)).blob();
      const files = [new File([blob], 'amora-share.png', { type: 'image/png' })];

      const shareText = `${property.title ?? 'Imóvel aMORA'}\nGostei desse imóvel que encontrei através da aMORA. Dê uma olhada!`;
      const shareUrl = property.sourceUrl;

      // Web Share API com arquivo
      if (navigator.canShare && navigator.canShare({ files })) {
        await navigator.share({
          files,
          title: 'aMORA - Imóvel',
          text: shareText,
          url: shareUrl,
        });
        setIsSharing(false);
        return;
      }

      // Fallback: abrir popups para WhatsApp/Instagram/Twitter
      const encodedText = encodeURIComponent(`${shareText} ${shareUrl}`);
      const wa = `https://wa.me/?text=${encodedText}`;
      const tw = `https://twitter.com/intent/tweet?text=${encodedText}`;
      // Instagram não tem share web oficial com pré-preenchimento de texto/imagem
      // Abrimos a página como instrução ao usuário
      const ig = `https://www.instagram.com/`;

      openSharePopup(wa, 'Compartilhar no WhatsApp');
      setTimeout(() => openSharePopup(tw, 'Compartilhar no Twitter'), 400);
      setTimeout(() => openSharePopup(ig, 'Abrir Instagram'), 800);
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Card className={`relative transition-all duration-200 hover:shadow-lg ${
      isSelected ? 'ring-2 ring-blue-500' : ''
    }`}>
      {/* Imagem do Imóvel */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
        {property.photos && property.photos.length > 0 ? (
          <img
            src={property.photos[0]}
            alt={property.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200">
            <Home className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Score Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={`${getScoreColor(property.score)} text-white`}>
            <BarChart3 className="mr-1 h-3 w-3" />
            {formatScore(property.score)}
          </Badge>
        </div>

        {/* Preço Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-black/80 text-white text-sm font-bold">
            {formatPrice(property.price)}
          </Badge>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <CardHeader className="pb-2">
        <h3 className="line-clamp-2 text-lg font-semibold leading-tight">
          {property.title}
        </h3>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="mr-1 h-4 w-4" />
          {property.neigh && property.city ? `${property.neigh}, ${property.city}` : 'Localização não informada'}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Características Principais */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex items-center justify-center rounded-lg bg-gray-50 p-2">
            <Ruler className="mr-1 h-4 w-4 text-gray-600" />
            <span className="font-medium">{property.m2 || 'N/A'}m²</span>
          </div>
          <div className="flex items-center justify-center rounded-lg bg-gray-50 p-2">
            <Home className="mr-1 h-4 w-4 text-gray-600" />
            <span className="font-medium">{property.rooms || 'N/A'} qts</span>
          </div>
          <div className="flex items-center justify-center rounded-lg bg-gray-50 p-2">
            <Car className="mr-1 h-4 w-4 text-gray-600" />
            <span className="font-medium">{property.parking || '0'} vagas</span>
          </div>
        </div>

        {/* Informações Adicionais */}
        {property.condo && (
          <div className="mt-3 text-sm text-gray-600">
            <span className="font-medium">Condomínio:</span> {formatPrice(property.condo)}/mês
          </div>
        )}
      </CardContent>

      {/* Ações do Card */}
      {showActions && (
        <CardFooter className="flex justify-between pt-0">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavorite}
              className={`h-8 w-8 p-0 ${isFavorited ? 'text-red-500' : 'text-gray-400'}`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment?.(property.id || '')}
              className="h-8 w-8 p-0 text-gray-400 hover:text-blue-500"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCompare?.(property)}
              className="h-8 text-xs"
            >
              Comparar
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-blue-500"
              onClick={handleShare}
              disabled={isSharing}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
