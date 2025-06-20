import React, { useState } from 'react';
import { X, Heart } from 'lucide-react';
import './style.css';

const GiftModal = ({ isOpen, onClose, recipient }) => {
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');

  const presetAmounts = [5, 10, 20, 50, 100, 250];

  // Função para formatar valor como moeda
  const formatCurrency = (value) => {
    // Remove tudo que não é número
    const numericValue = value.replace(/\D/g, '');
    
    if (!numericValue) return '';
    
    // Converte para número e divide por 100 para ter os centavos
    const number = parseInt(numericValue) / 100;
    
    // Formata como moeda brasileira
    return number.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  // Função para obter valor numérico do input formatado
  const getNumericValue = (formattedValue) => {
    if (!formattedValue) return 0;
    
    // Remove R$, espaços e pontos, substitui vírgula por ponto
    const cleanValue = formattedValue
      .replace(/R\$\s?/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    
    return parseFloat(cleanValue) || 0;
  };

  // Função para somar valor preset ao input
  const handleAmountAdd = (amount) => {
    const currentValue = getNumericValue(customAmount);
    const newValue = currentValue + amount;
    
    // Formatar o novo valor
    const formattedValue = formatCurrency((newValue * 100).toString());
    setCustomAmount(formattedValue);
  };

  // Função para lidar com mudanças no input
  const handleCustomAmountChange = (e) => {
    const inputValue = e.target.value;
    
    // Se o usuário apagar tudo, limpar o campo
    if (!inputValue) {
      setCustomAmount('');
      return;
    }
    
    // Aplicar máscara
    const formatted = formatCurrency(inputValue);
    setCustomAmount(formatted);
  };

  // Função para enviar o mimo
  const handleSendGift = () => {
    const amount = getNumericValue(customAmount);
    if (amount && amount > 0) {
      console.log('Enviando mimo:', {
        recipient: recipient.name,
        amount: amount,
        message: message
      });
      onClose();
      // Reset form
      setCustomAmount('');
      setMessage('');
    }
  };

  // Verificar se o valor é válido
  const isValidAmount = () => {
    const amount = getNumericValue(customAmount);
    return amount > 0;
  };

  // Função para limpar o valor
  const handleClearAmount = () => {
    setCustomAmount('');
  };

  if (!isOpen) return null;

  return (
    <div className="gift-modal-overlay" onClick={onClose}>
      <div className="gift-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="gift-modal-header">
          <h2 className="gift-modal-title">Enviar mimo</h2>
          <button className="gift-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="gift-modal-content">
          {/* Recipient Info */}
          <div className="gift-recipient">
            <div className="gift-recipient-avatar">
              <img src={recipient.avatar} alt={recipient.name} />
              <div className="gift-recipient-badge">Grátis</div>
            </div>
            <div className="gift-recipient-info">
              <h3 className="gift-recipient-name">{recipient.name}</h3>
              <p className="gift-recipient-message">
                Vai ficar muito feliz em receber seu mimo!
              </p>
            </div>
          </div>

          {/* Amount Selection */}
          <div className="gift-amounts">
            <div className="gift-preset-amounts">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  className="gift-amount-btn"
                  onClick={() => handleAmountAdd(amount)}
                  type="button"
                >
                  + R$ {amount}
                </button>
              ))}
            </div>

            <div className="gift-custom-amount">
              <div className="gift-input-header">
                <label className="gift-input-label">VALOR TOTAL</label>
                {customAmount && (
                  <button 
                    className="gift-clear-btn"
                    onClick={handleClearAmount}
                    type="button"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <div className="gift-input-wrapper">
                <input
                  type="text"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  placeholder="R$ 0,00"
                  className="gift-custom-input"
                />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="gift-message">
            <label className="gift-input-label">
              DIGITE UMA MENSAGEM (OPCIONAL)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escreva uma mensagem carinhosa..."
              className="gift-message-input"
              maxLength={500}
            />
            <div className="gift-message-counter">
              {message.length}/500
            </div>
          </div>

          {/* Send Button */}
          <button
            className={`gift-send-btn ${isValidAmount() ? 'active' : ''}`}
            onClick={handleSendGift}
            disabled={!isValidAmount()}
            type="button"
          >
            <Heart size={20} />
            {isValidAmount() 
              ? `Enviar ${customAmount}` 
              : 'Digite um valor'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default GiftModal;