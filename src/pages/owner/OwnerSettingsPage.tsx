import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Building2, Link2, MapPin, Phone, Upload, Save } from 'lucide-react';

export const OwnerSettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Configurações da Empresa</h1>
          <p className="text-sm text-[#94A3B8]">
            Edite os dados cadastrais, slug e fotos da sua barbearia
          </p>
        </div>

        <Button leftIcon={<Save className="w-4 h-4" />}>
          Salvar Dados
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identidade Visual & Vitrine</CardTitle>
          <CardDescription>Logo e banner exibidos para os clientes na vitrine pública</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-[#1E293B] border border-dashed border-slate-600 flex flex-col items-center justify-center text-slate-400 hover:border-teal-400 transition-colors cursor-pointer">
              <Upload className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-semibold">Logo (5MB)</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-white">Logo do Estabelecimento</p>
              <p className="text-xs text-slate-400">Formatos aceitos: JPG, PNG ou WEBP (até 5MB).</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <Input
              label="Nome do Estabelecimento"
              defaultValue="Barbearia Vintage Club"
              leftIcon={<Building2 className="w-4 h-4" />}
            />
            <Input
              label="Slug da Vitrine Pública"
              defaultValue="vintage-club"
              leftIcon={<Link2 className="w-4 h-4" />}
              helperText="sinalizego.com/empresa/vintage-club"
            />
            <Input
              label="WhatsApp de Contato"
              defaultValue="11999999999"
              leftIcon={<Phone className="w-4 h-4" />}
            />
            <Input
              label="Endereço Completo"
              defaultValue="Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
              leftIcon={<MapPin className="w-4 h-4" />}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
