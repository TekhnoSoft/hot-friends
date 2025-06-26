import React, { useState, useEffect } from 'react';
import { X, CreditCard, QrCode } from 'lucide-react';
import Modal from '../Modal';
import './style.css';

const PaymentModal = ({ isOpen, onClose, post, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatPrice = (price) => {
    if (!price) return 'R$ 0,00';
    return `R$ ${Number(price).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
      value = value.match(/.{1,4}/g).join(' ');
    }
    if (value.length <= 19) setCardNumber(value);
  };

  const handleCardExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length <= 5) setCardExpiry(value);
  };

  const handleCardCVVChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) setCardCVV(value);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Aqui você implementará a chamada para a API de pagamento
      // const response = await api.post('/payments', {
      //   postId: post.id,
      //   paymentMethod,
      //   cardData: paymentMethod === 'card' ? {
      //     number: cardNumber.replace(/\s/g, ''),
      //     name: cardName,
      //     expiry: cardExpiry,
      //     cvv: cardCVV
      //   } : null
      // });

      // Simulando sucesso
      await new Promise(resolve => setTimeout(resolve, 1500));
      onPaymentSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      // Implementar tratamento de erro aqui
    } finally {
      setIsLoading(false);
    }
  };

  const renderPaymentMethodSelection = () => (
    <div className="payment-methods">
      <button
        className={`payment-method-button ${paymentMethod === 'card' ? 'selected' : ''}`}
        onClick={() => setPaymentMethod('card')}
      >
        <CreditCard size={24} />
        <span>Cartão</span>
      </button>
      <button
        className={`payment-method-button ${paymentMethod === 'pix' ? 'selected' : ''}`}
        onClick={() => setPaymentMethod('pix')}
      >
        <QrCode size={24} />
        <span>PIX</span>
      </button>
    </div>
  );

  const renderCardForm = () => (
    <div className="card-form">
      <div className="form-group">
        <label>Número do Cartão</label>
        <input
          type="text"
          value={cardNumber}
          onChange={handleCardNumberChange}
          placeholder="0000 0000 0000 0000"
        />
      </div>
      <div className="form-group">
        <label>Nome no Cartão</label>
        <input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value.toUpperCase())}
          placeholder="NOME COMO ESTÁ NO CARTÃO"
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Validade</label>
          <input
            type="text"
            value={cardExpiry}
            onChange={handleCardExpiryChange}
            placeholder="MM/AA"
          />
        </div>
        <div className="form-group">
          <label>CVV</label>
          <input
            type="text"
            value={cardCVV}
            onChange={handleCardCVVChange}
            placeholder="000"
          />
        </div>
      </div>
    </div>
  );

  const renderPixPayment = () => (
    <div className="pix-container">
      <div className="qr-code-placeholder">
        {/* Aqui você colocará o QR Code real */}
        <QrCode size={200} />
      </div>
      <p className="pix-instructions">
        Escaneie o QR Code acima com seu aplicativo de pagamento ou copie a chave PIX abaixo
      </p>
      <button className="copy-pix-key">
        Copiar Chave PIX
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pagamento"
    >
      <div className="payment-header">
        <p className="payment-amount">Valor: {formatPrice(post.price)}</p>
      </div>

      {renderPaymentMethodSelection()}

      {paymentMethod === 'card' && renderCardForm()}
      {paymentMethod === 'pix' && renderPixPayment()}

      {paymentMethod === 'card' && (
        <button
          className={`payment-submit-button ${isLoading ? 'loading' : ''}`}
          onClick={handleSubmit}
          disabled={isLoading || !cardNumber || !cardName || !cardExpiry || !cardCVV}
        >
          {isLoading ? 'Processando...' : 'Pagar Agora'}
        </button>
      )}
    </Modal>
  );
};

export default PaymentModal; 