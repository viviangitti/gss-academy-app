import { useEffect, useRef, useState } from 'react';
import { Download, Share2, Check } from 'lucide-react';

interface Props {
  name: string;
  brandName: string;
  date: string; // dd/mm/aaaa
  accent: string;
}

// Desenha o certificado numa imagem (canvas) 1080x1350 — formato de story, pronto
// pra baixar e postar. Sem dependências: tudo na Canvas API.
function drawCert(canvas: HTMLCanvasElement, { name, brandName, date, accent }: Props) {
  const W = 1080;
  const H = 1350;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Fundo navy com leve gradiente
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1c1c36');
  g.addColorStop(1, '#0f0f20');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Molduras
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(52, 52, W - 104, H - 104);
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 1;
  ctx.strokeRect(70, 70, W - 140, H - 140);

  ctx.textAlign = 'center';

  // Marca
  ctx.fillStyle = accent;
  ctx.font = '700 58px Georgia, serif';
  ctx.fillText('eleva', W / 2, 210);

  // Faixa "CERTIFICADO DE FORMAÇÃO"
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.font = '600 30px Arial, sans-serif';
  ctx.letterSpacing = '10px';
  ctx.fillText('CERTIFICADO DE FORMAÇÃO', W / 2, 300);
  ctx.letterSpacing = '0px';

  // linha divisória curta
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 70, 345);
  ctx.lineTo(W / 2 + 70, 345);
  ctx.stroke();

  // "Certificamos que"
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '400 34px Arial, sans-serif';
  ctx.fillText('Certificamos que', W / 2, 500);

  // Nome (grande)
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 78px Georgia, serif';
  // quebra o nome se muito largo
  const maxW = W - 220;
  let fontSize = 78;
  ctx.font = `700 ${fontSize}px Georgia, serif`;
  while (ctx.measureText(name).width > maxW && fontSize > 40) {
    fontSize -= 4;
    ctx.font = `700 ${fontSize}px Georgia, serif`;
  }
  ctx.fillText(name, W / 2, 600);

  // sublinhado do nome
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 260, 640);
  ctx.lineTo(W / 2 + 260, 640);
  ctx.stroke();

  // texto
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.font = '400 36px Arial, sans-serif';
  ctx.fillText('concluiu a trilha de formação', W / 2, 740);
  ctx.fillText('de produtos da marca', W / 2, 792);

  // Marca do fabricante
  ctx.fillStyle = accent;
  ctx.font = '700 54px Georgia, serif';
  ctx.fillText(brandName, W / 2, 880);

  // Selo circular
  const cy = 1070;
  ctx.beginPath();
  ctx.arc(W / 2, cy, 90, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.fillStyle = '#12122a';
  ctx.font = '700 30px Arial, sans-serif';
  ctx.fillText('TRILHA', W / 2, cy - 8);
  ctx.font = '800 46px Arial, sans-serif';
  ctx.fillText('100%', W / 2, cy + 38);

  // Data
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '400 30px Arial, sans-serif';
  ctx.fillText(`Concluído em ${date}`, W / 2, 1235);
}

export default function Certificado(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (canvasRef.current) drawCert(canvasRef.current, props);
  }, [props]);

  const filename = `certificado-eleva-${props.brandName.toLowerCase().replace(/\s+/g, '-')}.png`;

  const toBlob = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      const c = canvasRef.current;
      if (!c) return resolve(null);
      c.toBlob((b) => resolve(b), 'image/png');
    });

  const baixar = async () => {
    const blob = await toBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const compartilhar = async () => {
    const blob = await toBlob();
    if (!blob) return baixar();
    const file = new File([blob], filename, { type: 'image/png' });
    const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean };
    if (nav.canShare && nav.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Meu certificado Eleva',
          text: `Concluí a trilha de formação da ${props.brandName}! 🎓`,
        });
        setShared(true);
        setTimeout(() => setShared(false), 1500);
        return;
      } catch {
        /* cancelou ou falhou → baixa */
      }
    }
    baixar();
  };

  return (
    <div className="wp-cert">
      <canvas ref={canvasRef} className="wp-cert-canvas" />
      <div className="wp-cert-actions">
        <button className="wp-cert-btn wp-cert-btn-main" onClick={compartilhar}>
          {shared ? <><Check size={16} className="wp-ico" /> Compartilhado</> : <><Share2 size={16} className="wp-ico" /> Compartilhar</>}
        </button>
        <button className="wp-cert-btn" onClick={baixar}>
          <Download size={16} className="wp-ico" /> Baixar
        </button>
      </div>
    </div>
  );
}
