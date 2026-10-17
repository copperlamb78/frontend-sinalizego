import React, { useState } from 'react';
import { Card, CardContent, Input, Button, toast } from '@/design-system';
import { useAuth } from '@/features/auth';
import { clientService } from '../services/clientService';

export const ProfilePersonalForm: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPhone = (val: string) => {
    const numbers = val.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Campo Obrigatório', { description: 'Por favor, informe seu nome.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      await clientService.updateProfile({
        name: name.trim(),
        phone: cleanPhone || undefined,
      });

      updateUser({ name: name.trim(), phone: cleanPhone });
      toast.success('Dados Atualizados', {
        description: 'Suas informações cadastrais foram salvas com sucesso.',
      });
    } catch (error: any) {
      toast.error('Erro ao Atualizar', {
        description: error?.response?.data?.message || 'Falha ao salvar dados de contato.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border bg-surface shadow-xs" data-testid="profile-personal-card">
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-text-primary">
            Dados Pessoais
          </h3>
          <p className="text-xs text-text-muted">
            Informações utilizadas para contato e identificação nas barbearias
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome Completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
            required
            data-testid="input-profile-name"
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary block">
              E-mail de Cadastro
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface-raised text-text-muted cursor-not-allowed"
            />
            <span className="text-[11px] text-text-muted block">
              O e-mail é sua chave principal de autenticação e não pode ser alterado diretamente.
            </span>
          </div>

          <Input
            label="Telefone / WhatsApp"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="(61) 99999-9999"
            data-testid="input-profile-phone"
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              className="font-bold text-xs h-9 px-5 shadow-xs"
              data-testid="btn-salvar-perfil"
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
