import React from 'react';
import { Badge } from '@/design-system';
import type { ClientCreditItem } from '../types';

interface CreditHistoryTableProps {
  credits: ClientCreditItem[];
}

export const CreditHistoryTable: React.FC<CreditHistoryTableProps> = ({ credits }) => {
  if (credits.length === 0) {
    return (
      <div className="p-8 text-center bg-surface border border-border rounded-xl text-text-muted text-xs">
        Nenhum registro de crédito encontrado no histórico.
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs">
      <div className="p-4 sm:p-5 border-b border-border">
        <h3 className="text-sm sm:text-base font-bold text-text-primary">
          Histórico de Movimentações
        </h3>
        <p className="text-xs text-text-muted">
          Extrato detalhado de créditos gerados por cancelamentos e abatimentos aplicados
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-raised border-b border-border text-text-muted font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 sm:px-6 py-3">Data</th>
              <th className="px-4 sm:px-6 py-3">Estabelecimento</th>
              <th className="px-4 sm:px-6 py-3">Valor</th>
              <th className="px-4 sm:px-6 py-3">Validade</th>
              <th className="px-4 sm:px-6 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {credits.map((item) => {
              const formattedDate = new Date(item.createdAt).toLocaleDateString('pt-BR');
              const formattedExp = new Date(item.expiresAt).toLocaleDateString('pt-BR');
              const formattedAmount = `R$ ${item.amount.toFixed(2).replace('.', ',')}`;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-surface-raised/40 transition-colors"
                  data-testid={`credit-row-${item.id}`}
                >
                  <td className="px-4 sm:px-6 py-3.5 text-text-muted">{formattedDate}</td>
                  <td className="px-4 sm:px-6 py-3.5 font-semibold text-text-primary">
                    {item.company?.businessName || 'Barbearia'}
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 font-bold text-text-primary">
                    {formattedAmount}
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 text-text-muted">
                    Até {formattedExp}
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 text-right">
                    {item.status === 'AVAILABLE' ? (
                      <Badge variant="success" size="sm" className="font-bold text-[10px]">
                        Disponível
                      </Badge>
                    ) : item.status === 'USED' ? (
                      <Badge variant="neutral" size="sm" className="text-[10px]">
                        Utilizado
                      </Badge>
                    ) : (
                      <Badge variant="danger" size="sm" className="text-[10px]">
                        Expirado
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
