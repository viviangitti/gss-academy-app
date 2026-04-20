import { useState } from 'react';
import { MessageCircle, Send, Check, Star } from 'lucide-react';
import './Feedback.css';

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [mostUsed, setMostUsed] = useState('');
  const [whatMissing, setWhatMissing] = useState('');
  const [bug, setBug] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!rating && !mostUsed && !whatMissing && !bug && !suggestion) return;

    // Monta mensagem do WhatsApp
    const parts = [
      `🌟 *Feedback MAESTR.IA*`,
      '',
      rating ? `Nota geral: ${'⭐'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)` : '',
      mostUsed ? `\n*Feature mais útil:*\n${mostUsed}` : '',
      whatMissing ? `\n*O que está faltando:*\n${whatMissing}` : '',
      bug ? `\n*Bug encontrado:*\n${bug}` : '',
      suggestion ? `\n*Sugestão:*\n${suggestion}` : '',
    ].filter(Boolean).join('\n');

    const encoded = encodeURIComponent(parts);
    // Substitua pelo número do Gerson. Por enquanto abre conversa sem número.
    const url = `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
    setSent(true);
  };

  if (sent) {
    return (
      <div className="feedback-page">
        <div className="feedback-success card">
          <Check size={48} />
          <h2>Obrigado pelo feedback!</h2>
          <p>Sua mensagem foi aberta no WhatsApp. Envie para confirmar. Seu feedback é essencial para melhorar o app.</p>
          <button className="btn btn-outline" onClick={() => { setSent(false); setRating(0); setMostUsed(''); setWhatMissing(''); setBug(''); setSuggestion(''); }}>
            Enviar outro feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-page">
      <div className="feedback-hero card">
        <MessageCircle size={24} />
        <div>
          <h2>Seu feedback importa</h2>
          <p>Ajude a melhorar o app. Leva menos de 2 minutos.</p>
        </div>
      </div>

      {/* Rating */}
      <div className="feedback-section card">
        <label>Nota geral do app</label>
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              className={`rating-star ${rating >= n ? 'active' : ''}`}
              onClick={() => setRating(n)}
            >
              <Star size={32} fill={rating >= n ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
      </div>

      {/* Most used */}
      <div className="feedback-section card">
        <label>Qual feature você usou MAIS?</label>
        <textarea
          rows={3}
          value={mostUsed}
          onChange={e => setMostUsed(e.target.value)}
          placeholder="Ex: Pesquisei muito cliente antes de reunião. Muito útil..."
        />
      </div>

      {/* What's missing */}
      <div className="feedback-section card">
        <label>O que está faltando?</label>
        <textarea
          rows={3}
          value={whatMissing}
          onChange={e => setWhatMissing(e.target.value)}
          placeholder="Ex: Poderia ter integração com meu CRM, ou uma feature específica..."
        />
      </div>

      {/* Bug */}
      <div className="feedback-section card">
        <label>Encontrou algum bug?</label>
        <textarea
          rows={3}
          value={bug}
          onChange={e => setBug(e.target.value)}
          placeholder="Ex: Ao clicar em X, aconteceu Y..."
        />
      </div>

      {/* Suggestion */}
      <div className="feedback-section card">
        <label>Sugestão livre</label>
        <textarea
          rows={3}
          value={suggestion}
          onChange={e => setSuggestion(e.target.value)}
          placeholder="Ex: Seria legal se..."
        />
      </div>

      <button className="btn btn-primary feedback-send" onClick={handleSend}>
        <Send size={16} /> Enviar via WhatsApp
      </button>

      <p className="feedback-hint">
        Ao enviar, abre o WhatsApp com seu feedback formatado. Você pode revisar antes de mandar.
      </p>
    </div>
  );
}
