import React, { useState } from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { Card, CardContent, Input, Button, Badge, toast } from '@/design-system';
import { useAuth } from '@/features/auth';
import { clientService } from '../services/clientService';

export const ProfileCpfCard: React.FC = () => {
  const { user, updateUser } = useAuth();

  const formatCpf = (val: string) => {
    const nums = val.replace(/\D/g, '').slice(0, 11);
    if (nums.length <= 3) return nums;
    if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
    if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
    return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`;
  };

  const initialCpf = user?.cpfCnpj ? formatCpf(user.cpfCnpj) : '';
  const [cpf, setCpf] = useState(initialCpf);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasCpf = Boolean(user?.cpfCnpj && user.cpfCnpj.length >= 11);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      toast.error('CPF Inválido', {
        description: 'Por favor, informe um CPF válido com 11 dígitos.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await clientService.updateCpf({ cpfCnpj: cleanCpf });
      updateUser({ cpfCnpj: cleanCpf });
      toast.success('Documento Atualizado', {
        description: 'Seu CPF foi validado e sincronizado com o gateway Asaas.',
      });
    } catch (error: any) {
      toast.error('Erro no CPF', {
        description: error?.response?.data?.message || 'Falha ao atualizar documento no gateway Asaas.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border bg-surface shadow-xs" data-testid="profile-cpf-card">
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-text-primary">
              Documento &amp; Cliente Financeiro
            </h3>
            <p className="text-xs text-text-muted">
              Necessário para emissão e conciliação instantânea de cobranças Pix via Asaas
            </p>
          </div>

          <div>
            {hasCpf ? (
              <Badge
                variant="success"
                size="sm"
                icon={<ShieldCheck className="h-3.5 w-3.5 shrink-0" />}
                className="font-bold text-[11px] whitespace-nowrap"
              >
                Cliente Asaas Ativo
              </Badge>
            ) : (
              <Badge
                variant="warning"
                size="sm"
                icon={<AlertCircle className="h-3.5 w-3.5 shrink-0" />}
                className="font-bold text-[11px] whitespace-nowrap"
              >
                Pendente de Cadastro
              </Badge>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="CPF do Titular"
            value={cpf}
            onChange={(e) => setCpf(formatCpf(e.target.value))}
            placeholder="000.000.000-00"
            required
            data-testid="input-profile-cpf"
          />

          <div className="pt-1">
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              isLoading={isSubmitting}
              className="font-semibold text-xs h-9 px-4"
              data-testid="btn-atualizar-cpf"
            >
              {hasCpf ? 'Atualizar CPF' : 'Vincular CPF'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
