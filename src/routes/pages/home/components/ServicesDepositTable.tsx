import React from 'react';

export interface ServiceDepositRow {
  name: string;
  duration: string;
  totalPrice: string;
  depositPercent: string;
  depositAmount: string;
  ruleLabel: string;
}

const defaultRows: ServiceDepositRow[] = [
  {
    name: 'Corte Degradê',
    duration: '30 min',
    totalPrice: 'R$ 35,00',
    depositPercent: '50%',
    depositAmount: 'R$ 17,50',
    ruleLabel: 'Sinal padrão',
  },
  {
    name: 'Barboterapia & Toalha Quente',
    duration: '30 min',
    totalPrice: 'R$ 30,00',
    depositPercent: '50%',
    depositAmount: 'R$ 15,00',
    ruleLabel: 'Sinal padrão',
  },
  {
    name: 'Combo Completo (Cabelo + Barba)',
    duration: '60 min',
    totalPrice: 'R$ 60,00',
    depositPercent: '50%',
    depositAmount: 'R$ 30,00',
    ruleLabel: 'Sinal padrão',
  },
  {
    name: 'Platinado Global / Química Longa',
    duration: '150 min',
    totalPrice: 'R$ 400,00',
    depositPercent: '30%',
    depositAmount: 'R$ 120,00',
    ruleLabel: 'Sinal flexível (≥ R$ 400)',
  },
  {
    name: 'Pezinho / Acabamento Rápido',
    duration: '15 min',
    totalPrice: 'R$ 12,00',
    depositPercent: '100%',
    depositAmount: 'R$ 12,00',
    ruleLabel: 'Sinal integral (< R$ 15)',
  },
];

export const ServicesDepositTable: React.FC = () => {
  return (
    <div className="space-y-3" data-testid="services-deposit-table">
      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="border-b border-border bg-surface-raised/60 text-text-muted font-bold">
            <tr>
              <th className="px-4 py-3.5">Serviço</th>
              <th className="px-4 py-3.5 hidden sm:table-cell">Duração</th>
              <th className="px-4 py-3.5">Preço Total</th>
              <th className="px-4 py-3.5">Sinal no Pix</th>
              <th className="px-4 py-3.5 hidden md:table-cell">Regra Aplicada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-text-primary">
            {defaultRows.map((row, index) => (
              <tr key={index} className="hover:bg-surface-raised/40 transition-colors">
                <td className="px-4 py-3.5 font-bold">
                  {row.name}
                  <span className="block text-[11px] font-normal text-text-muted sm:hidden">
                    {row.duration}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-text-muted hidden sm:table-cell">
                  {row.duration}
                </td>
                <td className="px-4 py-3.5 font-semibold">
                  {row.totalPrice}
                </td>
                <td className="px-4 py-3.5 font-bold text-primary">
                  {row.depositPercent}{' '}
                  <span className="text-xs font-normal text-text-secondary">
                    ({row.depositAmount})
                  </span>
                </td>
                <td className="px-4 py-3.5 text-xs text-text-muted hidden md:table-cell">
                  {row.ruleLabel}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-text-muted leading-relaxed">
        * Serviços abaixo de R$ 15,00 utilizam sinal integral (100%) para proteção da tarifa Pix. Em serviços de alto valor (≥ R$ 400,00), o estabelecimento pode optar por 30% para facilitar o agendamento de procedimentos longos.
      </p>
    </div>
  );
};

export default ServicesDepositTable;
