import { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Calendar, Clock, MapPin } from 'lucide-react';

export const ClientAppointmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PENDING' | 'HISTORY'>('UPCOMING');

  const demoAppointments = [
    {
      id: 'apt-01',
      serviceName: 'Corte Degrade & Barboterapia',
      companyName: 'Barbearia Vintage Club',
      date: '25 de Agosto de 2026',
      time: '15:30',
      status: 'CONFIRMED' as const,
      totalPrice: 85.0,
      downPayment: 42.5,
      address: 'Av. Paulista, 1000 - Bela Vista, SP'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Meus Agendamentos</h1>
          <p className="text-sm text-[#94A3B8]">
            Acompanhe o status de confirmação e vouchers dos seus atendimentos
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'UPCOMING'
              ? 'bg-[#14B8A6] text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Confirmados & Próximos
        </button>
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'PENDING'
              ? 'bg-[#14B8A6] text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Aguardando Pix
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'HISTORY'
              ? 'bg-[#14B8A6] text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Histórico
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {demoAppointments.map((apt) => (
          <Card key={apt.id} hoverEffect className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="teal" dot>CONFIRMADO</Badge>
                  <span className="text-xs text-slate-400 font-mono">#{apt.id}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{apt.serviceName}</h3>
                <p className="text-xs text-teal-400 font-semibold">{apt.companyName}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{apt.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{apt.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{apt.address}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                <div className="text-right">
                  <p className="text-[11px] text-slate-400">Total: R$ {apt.totalPrice.toFixed(2)}</p>
                  <p className="text-sm font-bold text-teal-400">Sinal Pago: R$ {apt.downPayment.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm">
                    Ver Voucher
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                    Cancelar (&gt;24h)
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
