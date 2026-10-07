import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  StorefrontView,
  BookingStepTwoView,
  type StorefrontService,
  type StorefrontCompany,
  type BookingSelectionData,
} from '@/features/storefront';
import { toast } from '@/design-system';

/**
 * Página fina (Thin Page) da Vitrine Pública do Estabelecimento
 * Rota: /empresa/:slug ou /b/:slug
 */
export const StorefrontPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Slug padrão de demonstração caso nenhum parâmetro seja informado
  const effectiveSlug = slug || 'barbers-club';

  // Estado do serviço selecionado para avanço ao Passo 2
  const [selectedBooking, setSelectedBooking] = useState<{
    service: StorefrontService;
    company: StorefrontCompany;
  } | null>(null);

  const handleSelectService = (service: StorefrontService, company: StorefrontCompany) => {
    setSelectedBooking({ service, company });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStorefront = () => {
    setSelectedBooking(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToCheckout = (data: BookingSelectionData) => {
    toast.success(
      `Cadeira reservada para ${data.time}! Sinal de R$ ${data.downPaymentAmount.toFixed(2)} aguardando Pix.`
    );
  };

  if (selectedBooking) {
    return (
      <BookingStepTwoView
        company={selectedBooking.company}
        service={selectedBooking.service}
        onBack={handleBackToStorefront}
        onProceedToCheckout={handleProceedToCheckout}
      />
    );
  }

  return (
    <StorefrontView
      slug={effectiveSlug}
      onSelectService={handleSelectService}
    />
  );
};

export default StorefrontPage;
