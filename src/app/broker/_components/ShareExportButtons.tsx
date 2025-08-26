'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, Loader2 } from 'lucide-react';

interface ShareExportButtonsProps {
  brokerName: string;
  brokerCompany?: string;
  brokerBio?: string;
}

export function ShareExportButtons({ brokerName, brokerCompany, brokerBio }: ShareExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Gera uma imagem PNG para compartilhamento
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

    // Nome do corretor
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 48px Inter, Arial, sans-serif';
    const name = brokerName.slice(0, 40);
    ctx.fillText(name, pad + 40, pad + 120);

    // Empresa (se houver)
    if (brokerCompany) {
      ctx.font = '32px Inter, Arial, sans-serif';
      ctx.fillStyle = '#374151';
      const company = brokerCompany.slice(0, 50);
      ctx.fillText(company, pad + 40, pad + 180);
    }

    // Bio
    ctx.font = '28px Inter, Arial, sans-serif';
    ctx.fillStyle = '#6b7280';
    const bio = (brokerBio || 'Corretor especializado em imóveis residenciais').slice(0, 80);
    wrapText(ctx, bio, pad + 40, pad + 240, width - pad * 2 - 80, 36);

    // CTA
    ctx.font = 'bold 36px Inter, Arial, sans-serif';
    ctx.fillStyle = '#111827';
    const cta = 'Encontre seu imóvel dos sonhos com aMORA!';
    wrapText(ctx, cta, pad + 40, pad + 400, width - pad * 2 - 80, 44);

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

  const handleExportPNG = async () => {
    try {
      setIsExporting(true);
      const dataUrl = await generateShareImage();
      const blob = await (await fetch(dataUrl)).blob();
      
      // Criar link de download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `amora-${brokerName.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao exportar PNG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const dataUrl = await generateShareImage();
      const blob = await (await fetch(dataUrl)).blob();
      const files = [new File([blob], 'amora-share.png', { type: 'image/png' })];

      const shareText = `${brokerName} - Corretor aMORA\n${brokerCompany ? brokerCompany + '\n' : ''}${brokerBio || 'Corretor especializado em imóveis residenciais'}\n\nEncontre seu imóvel dos sonhos!`;
      const shareUrl = window.location.href;

      // Web Share API com arquivo
      if (navigator.canShare && navigator.canShare({ files })) {
        await navigator.share({
          files,
          title: `${brokerName} - Corretor aMORA`,
          text: shareText,
          url: shareUrl,
        });
        return;
      }

      // Fallback: abrir popups para WhatsApp/Instagram/Twitter
      const encodedText = encodeURIComponent(`${shareText} ${shareUrl}`);
      const wa = `https://wa.me/?text=${encodedText}`;
      const tw = `https://twitter.com/intent/tweet?text=${encodedText}`;
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
    <div className="flex gap-3">
      <Button 
        onClick={handleExportPNG}
        variant="outline"
        disabled={isExporting}
        className="flex items-center gap-2"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {isExporting ? 'Exportando...' : 'Exportar PNG'}
      </Button>
      
      <Button 
        onClick={handleShare}
        variant="outline"
        disabled={isSharing}
        className="flex items-center gap-2"
      >
        {isSharing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
        {isSharing ? 'Compartilhando...' : 'Compartilhar'}
      </Button>
    </div>
  );
}
