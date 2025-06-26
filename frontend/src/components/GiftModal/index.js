import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import Modal from '../Modal';
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enviar mimo"
      className="gift-modal"
    >
      {/* Recipient Info */}
      <div className="gift-recipient">
        <div className="gift-recipient-avatar">
          <img src={recipient?.avatar} alt={recipient?.name} />
          <div className="gift-recipient-badge">Grátis</div>
        </div>
        <div className="gift-recipient-info">
          <h3 className="gift-recipient-name">{recipient?.name}</h3>
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
    </Modal>
  );
};

export default GiftModal;