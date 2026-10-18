import React, { useState } from 'react';
import {
  MapPin,
  Save,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/design-system/ui/card';
import { Button } from '@/design-system/ui/button';
import { Input } from '@/design-system/ui/input';
import type { DashboardCompany, UpdateCompanyPayload } from '../types';

export interface DashboardSettingsViewProps {
  company: DashboardCompany | null;
  onUpdateCompany: (companyId: string, payload: UpdateCompanyPayload) => Promise<void>;
}

export const DashboardSettingsView: React.FC<DashboardSettingsViewProps> = ({
  company,
  onUpdateCompany,
}) => {
  const [businessName, setBusinessName] = useState(company?.businessName || '');
  const [providerType, setProviderType] = useState(company?.providerType || 'Barbearia');
  const [whatsapp, setWhatsapp] = useState(company?.whatsapp || '');
  const [chairsCount, setChairsCount] = useState(company?.chairsCount || 1);
  const [zipCode, setZipCode] = useState(company?.zipCode || '');
  const [street, setStreet] = useState(company?.street || '');
  const [number, setNumber] = useState(company?.number || '');
  const [district, setDistrict] = useState(company?.district || '');
  const [city, setCity] = useState(company?.city || '');
  const [state, setState] = useState(company?.state || '');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const storefrontFullUrl = company?.slug
    ? `${window.location.origin}/b/${company.slug}`
    : '';

  const handleCopyLink = () => {
    if (!storefrontFullUrl) return;
    navigator.clipboard.writeText(storefrontFullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setErrorMessage(null);
    setIsSaving(true);

    try {
      await onUpdateCompany(company.id, {
        businessName: businessName.trim(),
        providerType: providerType.trim(),
        whatsapp: whatsapp.trim() || undefined,
        chairsCount: Number(chairsCount),
        zipCode: zipCode.trim(),
        street: street.trim(),
        number: number.trim(),
        district: district.trim(),
        city: city.trim(),
        state: state.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setErrorMessage(
        errObj.response?.data?.message || 'Falha ao salvar alterações da empresa.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Link de Divulgação da Vitrine Pública */}
      <Card className="p-5 border-primary/20 bg-primary/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Link da sua Vitrine de Agendamentos
            </span>
            <p className="text-xs text-text-muted">
              Compartilhe com seus clientes no Instagram, WhatsApp e redes sociais para receber agendamentos automáticos com sinal Pix:
            </p>
            <div className="font-mono text-xs font-semibold text-text-primary break-all bg-surface px-3 py-1.5 rounded-md border border-border inline-block">
              {storefrontFullUrl}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              leftIcon={copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            >
              {copiedLink ? 'Copiado!' : 'Copiar Link'}
            </Button>

            <a
              href={`/b/${company?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-3 h-9 text-xs font-bold rounded-[4px] bg-primary text-white hover:bg-primary-hover transition-colors gap-1.5"
            >
              <span>Ver Vitrine</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </Card>

      {/* Formulário de Configurações da Empresa */}
      <Card className="p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h2 className="text-sm font-bold text-text-primary tracking-tight">
                Dados Cadastrais do Estabelecimento
              </h2>
              <p className="text-xs text-text-muted">
                Mantenha suas informações comerciais atualizadas
              </p>
            </div>

            <div className="flex items-center gap-3">
              {saveSuccess && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4" />
                  Salvo com sucesso!
                </span>
              )}

              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Salvar Informações
              </Button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 flex items-center gap-2 text-danger text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome Comercial (Barbearia/Estúdio)"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />

            <Input
              label="Segmento / Tipo de Estabelecimento"
              value={providerType}
              onChange={(e) => setProviderType(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="WhatsApp Oficial de Atendimento"
              placeholder="Ex: 75999999999"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              helperText="Exibido na vitrine para que os clientes tirem dúvidas"
            />

            <Input
              label="Quantidade de Cadeiras / Bancadas"
              type="number"
              min="1"
              value={chairsCount}
              onChange={(e) => setChairsCount(Number(e.target.value))}
            />
          </div>

          {/* Endereço */}
          <div className="pt-2 border-t border-border space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Endereço do Estabelecimento
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="CEP"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                required
              />

              <div className="sm:col-span-2">
                <Input
                  label="Logradouro / Rua / Avenida"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Input
                label="Número"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
              />

              <Input
                label="Bairro"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              />

              <Input
                label="Cidade"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />

              <Input
                label="Estado (UF)"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};
