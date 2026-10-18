import React, { useState } from 'react';
import { ArrowLeft, Users, Check, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/design-system/ui/button';
import { Card, CardContent } from '@/design-system/ui/card';
import { BookingSelectedServiceCard } from './BookingSelectedServiceCard';
import { BookingDateCarousel } from './BookingDateCarousel';
import { BookingSlotGrid } from './BookingSlotGrid';
import { BookingBottomBar } from './BookingBottomBar';
import { estimateDeposit } from '@/features/checkout';
import { useAvailableSlots } from '../hooks/useAvailableSlots';
import { storefrontService } from '../services/storefrontService';
import type { StorefrontCompany, StorefrontService, StorefrontEmployee } from '../types/storefront.types';

export interface BookingSelectionData {
  company: StorefrontCompany;
  service: StorefrontService;
  date: string;
  time: string;
  downPaymentAmount: number;
  remainingAmount: number;
  employeeId?: string;
  employeeName?: string;
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
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Busca profissionais habilitados para o serviço selecionado
  const { data: eligibleEmployees = [] } = useQuery<StorefrontEmployee[]>({
    queryKey: ['eligible-employees', company.id, service.id],
    queryFn: () => storefrontService.getEligibleEmployees(company.id, service.id),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Consulta reativa dos horários livres na API (considerando profissional selecionado ou 'any')
  const { slots, isLoading } = useAvailableSlots({
    companyId: company.id,
    serviceId: service.id,
    date: selectedDate,
    employeeId: selectedEmployeeId || undefined,
  });

  const effectiveSlots = slots;

  // Cálculos financeiros transparentes (Regras N1 e N5)
  const { depositAmount: downPaymentAmount, remainingAmount } = React.useMemo(() => {
    return estimateDeposit(service.totalPrice, service.downPaymentPercent);
  }, [service.totalPrice, service.downPaymentPercent]);

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

  const handleSelectEmployee = (employeeId: string | null) => {
    setSelectedEmployeeId(employeeId);
    setSelectedSlot(null); // Reseta o slot selecionado para revalidar disponibilidade
  };

  const handleAdvance = () => {
    if (!selectedSlot) return;

    const chosenEmployee = eligibleEmployees.find((e) => e.id === selectedEmployeeId);

    onProceedToCheckout({
      company,
      service,
      date: selectedDate,
      time: selectedSlot,
      downPaymentAmount,
      remainingAmount,
      employeeId: selectedEmployeeId || undefined,
      employeeName: chosenEmployee ? chosenEmployee.name : 'Qualquer profissional',
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

        {/* Seleção do Profissional (Qualquer profissional vs Profissional específico) */}
        {eligibleEmployees.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                Escolha o Profissional
              </label>
              <span className="text-[11px] text-text-muted">
                {selectedEmployeeId ? 'Profissional selecionado' : 'Primeiro disponível'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {/* Opção: Qualquer profissional */}
              <button
                type="button"
                onClick={() => handleSelectEmployee(null)}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  selectedEmployeeId === null
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border bg-surface hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  {selectedEmployeeId === null && (
                    <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center text-white">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary leading-tight">
                    Qualquer profissional
                  </h4>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    Máxima disponibilidade
                  </p>
                </div>
              </button>

              {/* Profissionais cadastrados */}
              {eligibleEmployees.map((emp) => {
                const isSelected = selectedEmployeeId === emp.id;
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => handleSelectEmployee(emp.id)}
                    className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border bg-surface hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      {emp.avatarUrl ? (
                        <img
                          src={emp.avatarUrl}
                          alt={emp.name}
                          className="h-8 w-8 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-surface-raised flex items-center justify-center text-xs font-bold text-primary border border-border">
                          {emp.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      {isSelected && (
                        <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center text-white">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-primary leading-tight truncate">
                        {emp.name}
                      </h4>
                      <p className="text-[10px] text-text-muted mt-0.5 truncate">
                        {emp.roleTitle || 'Especialista'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
