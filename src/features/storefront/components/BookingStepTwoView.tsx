import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/design-system/ui/button';
import { Card, CardContent } from '@/design-system/ui/card';
import { BookingSelectedServiceCard } from './BookingSelectedServiceCard';
import { BookingDateCarousel } from './BookingDateCarousel';
import { BookingSlotGrid } from './BookingSlotGrid';
import { BookingBottomBar } from './BookingBottomBar';
import { useAvailableSlots } from '../hooks/useAvailableSlots';
import type { StorefrontCompany, StorefrontService } from '../types/storefront.types';

export interface BookingSelectionData {
  company: StorefrontCompany;
  service: StorefrontService;
  date: string;
  time: string;
  downPaymentAmount: number;
  remainingAmount: number;
}

interface BookingStepTwoViewProps {
  company: StorefrontCompany;
  service: StorefrontService;
  onBack: () => void;
  onProceedToCheckout: (data: BookingSelectionData) => void;
}

export const BookingStepTwoView: React.FC<BookingStepTwoViewProps> = ({
  company,
  service,
  onBack,
  onProceedToCheckout,
}) => {
  // Data inicial padrão: hoje formatado em YYYY-MM-DD
  const todayString = React.useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayString);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Consulta reativa dos horários livres na API
  const { slots, isLoading } = useAvailableSlots({
    companyId: company.id,
    serviceId: service.id,
    date: selectedDate,
  });

  // Em ambiente de desenvolvimento local, se a API estiver offline e retornar 0 slots,
  // injetamos os slots simulados padrão para não impedir a experiência visual e de teste do usuário
  const effectiveSlots = React.useMemo(() => {
    if (slots.length > 0) return slots;
    if (import.meta.env.DEV) {
      return ['09:00', '09:45', '10:30', '14:00', '14:45', '15:30', '16:15', '17:00'];
    }
    return [];
  }, [slots]);

  // Cálculos financeiros transparentes
  const numericPrice = typeof service.totalPrice === 'string' ? parseFloat(service.totalPrice) : service.totalPrice;
  let downPaymentPercentage = 50;
  if (numericPrice < 15) {
    downPaymentPercentage = 100;
  } else if (numericPrice >= 400 && service.downPaymentPercent) {
    downPaymentPercentage = service.downPaymentPercent;
  }
  const downPaymentAmount = (numericPrice * downPaymentPercentage) / 100;
  const remainingAmount = numericPrice - downPaymentAmount;

  // Formatação legível da data para exibição no rodapé
  const formattedDateLabel = React.useMemo(() => {
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      const day = parts[2];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      return `${day} de ${monthNames[monthIndex]}`;
    }
    return selectedDate;
  }, [selectedDate]);

  const handleSelectDate = (newDate: string) => {
    setSelectedDate(newDate);
    setSelectedSlot(null); // Reseta o horário ao trocar de dia
  };

  const handleAdvance = () => {
    if (!selectedSlot) return;

    onProceedToCheckout({
      company,
      service,
      date: selectedDate,
      time: selectedSlot,
      downPaymentAmount,
      remainingAmount,
    });
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col" data-testid="booking-step-two-view">
      {/* 1. Header do Fluxo / Barra de Voltar */}
      <header className="sticky top-0 z-30 w-full border-b border-border bg-surface/95 backdrop-blur-sm px-4 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={onBack}
              aria-label="Voltar para a vitrine"
              data-testid="step2-back-button"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-text-primary tracking-tight">
                Escolha da Data e Horário
              </h2>
              <p className="text-[11px] text-text-muted">
                Passo 2 de 3 • {company.businessName}
              </p>
            </div>
          </div>

          {/* Indicador Visual das 3 Etapas */}
          <div className="flex items-center gap-1.5" aria-label="Progresso do agendamento">
            <div className="h-1.5 w-5 rounded-full bg-primary" />
            <div className="h-1.5 w-5 rounded-full bg-primary" />
            <div className="h-1.5 w-5 rounded-full bg-surface-raised border border-border" />
          </div>
        </div>
      </header>

      {/* 2. Conteúdo Central */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-5 space-y-6">
        {/* Resumo do Serviço Escolhido */}
        <BookingSelectedServiceCard
          service={service}
          onEditService={onBack}
        />

        {/* 1. Seletor de Datas */}
        <BookingDateCarousel
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          workingHours={company.workingHours || []}
        />

        {/* 2. Grade de Horários Livres */}
        <BookingSlotGrid
          slots={effectiveSlots}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
          isLoading={isLoading}
        />

        {/* Box Informativo de Horário Garantido (Anti-Jargão) */}
        <Card className="bg-surface-raised/50 border-border">
          <CardContent className="p-4 space-y-1">
            <h5 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" />
              Seu horário fica 100% garantido
            </h5>
            <p className="text-xs text-text-secondary leading-relaxed">
              Ao avançar, este horário será reservado exclusivamente para você durante 15 minutos para conclusão do Pix. Sem filas e com atendimento pontual na cadeira.
            </p>
          </CardContent>
        </Card>
      </main>

      {/* 3. Barra Fixa Inferior com CTA de Avançar */}
      <BookingBottomBar
        dateLabel={formattedDateLabel}
        selectedSlot={selectedSlot}
        downPaymentAmount={downPaymentAmount}
        remainingAmount={remainingAmount}
        onAdvance={handleAdvance}
      />
    </div>
  );
};
