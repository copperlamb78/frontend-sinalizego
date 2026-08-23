import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Plus, Layers, Clock } from 'lucide-react';

export const OwnerServicesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Serviços & Grupos</h1>
          <p className="text-sm text-[#94A3B8]">
            Configure seu catálogo, tempo de duração e piso obrigatório de sinal (25% ou 50%)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" leftIcon={<Layers className="w-4 h-4 text-teal-400" />}>
            Novo Grupo
          </Button>
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Novo Serviço
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Corte Degrade Navalhado', group: 'Cortes Masculinos', duration: 45, price: 55.0, downPaymentPercent: 50 },
          { name: 'Barboterapia com Toalha Quente', group: 'Barba & Estética', duration: 30, price: 45.0, downPaymentPercent: 50 },
          { name: 'Combo Completo Cabelo + Barba', group: 'Combos Especiais', duration: 60, price: 90.0, downPaymentPercent: 25 },
          { name: 'Platinado / Nevou', group: 'Química & Coloração', duration: 120, price: 150.0, downPaymentPercent: 50 }
        ].map((svc) => (
          <Card key={svc.name} hoverEffect>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-slate-400">{svc.group}</span>
                <Badge variant="teal" size="sm">
                  Sinal {svc.downPaymentPercent}%
                </Badge>
              </div>
              <CardTitle className="text-base">{svc.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {svc.duration} min
                </span>
                <span className="font-bold text-white text-sm">
                  R$ {svc.price.toFixed(2)}
                </span>
              </div>
              <div className="pt-2 flex items-center gap-2">
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
