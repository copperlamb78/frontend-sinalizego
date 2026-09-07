import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialService } from '@/services/financial.service';
import type { PixKeyItem, CreatePixKeyPayload } from '@/types/financial.types';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Skeleton } from '@/components/common/Skeleton';
import {
  Key,
  Plus,
  Trash2,
  CheckCircle2,
  Star,
  Copy,
  Check,
  AlertTriangle,
  QrCode
} from 'lucide-react';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';

export const PixKeysManager: React.FC = () => {
  const queryClient = useQueryClient();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<PixKeyItem | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Form State
  const [keyType, setKeyType] = useState<'CPF' | 'CNPJ' | 'PHONE' | 'EMAIL' | 'EVP'>('CPF');
  const [keyValue, setKeyValue] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // 1. Fetch Pix Keys
  const { data: pixKeys = [], isLoading } = useQuery({
    queryKey: ['financial-pix-keys'],
    queryFn: () => financialService.getPixKeys(),
    staleTime: 1000 * 60 * 2 // 2 minutes
  });

  // 2. Add Pix Key Mutation
  const addMutation = useMutation({
    mutationFn: (payload: CreatePixKeyPayload) => financialService.addPixKey(payload),
    onSuccess: () => {
      toast.success('Chave Pix cadastrada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['financial-pix-keys'] });
      queryClient.invalidateQueries({ queryKey: ['company-balance'] });
      queryClient.invalidateQueries({ queryKey: ['owner-company-profile'] });
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(extractErrorMessage(err, 'Erro ao cadastrar chave Pix.'));
    }
  });

  // 3. Delete Pix Key Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => financialService.deletePixKey(id),
    onSuccess: () => {
      toast.success('Chave Pix removida com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['financial-pix-keys'] });
      queryClient.invalidateQueries({ queryKey: ['company-balance'] });
      queryClient.invalidateQueries({ queryKey: ['owner-company-profile'] });
      setKeyToDelete(null);
    },
    onError: (err: any) => {
      toast.error(extractErrorMessage(err, 'Erro ao apagar chave Pix.'));
    }
  });

  // 4. Set Default Pix Key Mutation
  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => financialService.setDefaultPixKey(id),
    onSuccess: () => {
      toast.success('Chave Pix principal atualizada!');
      queryClient.invalidateQueries({ queryKey: ['financial-pix-keys'] });
      queryClient.invalidateQueries({ queryKey: ['company-balance'] });
      queryClient.invalidateQueries({ queryKey: ['owner-company-profile'] });
    },
    onError: (err: any) => {
      toast.error(extractErrorMessage(err, 'Erro ao alterar chave Pix principal.'));
    }
  });

  const resetForm = () => {
    setKeyType('CPF');
    setKeyValue('');
    setIsDefault(false);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    toast.success('Chave Pix copiada!');
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  // Masking helpers
  const handleKeyChange = (val: string) => {
    if (keyType === 'CPF') {
      const clean = val.replace(/\D/g, '').slice(0, 11);
      let masked = clean;
      if (clean.length > 9) {
        masked = clean.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
      } else if (clean.length > 6) {
        masked = clean.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
      } else if (clean.length > 3) {
        masked = clean.replace(/(\d{3})(\d{1,3})/, '$1.$2');
      }
      setKeyValue(masked);
    } else if (keyType === 'CNPJ') {
      const clean = val.replace(/\D/g, '').slice(0, 14);
      let masked = clean;
      if (clean.length > 12) {
        masked = clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
      } else if (clean.length > 8) {
        masked = clean.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4');
      } else if (clean.length > 5) {
        masked = clean.replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
      } else if (clean.length > 2) {
        masked = clean.replace(/(\d{2})(\d{1,3})/, '$1.$2');
      }
      setKeyValue(masked);
    } else if (keyType === 'PHONE') {
      const clean = val.replace(/\D/g, '').slice(0, 11);
      let masked = clean;
      if (clean.length > 10) {
        masked = clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (clean.length > 6) {
        masked = clean.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else if (clean.length > 2) {
        masked = clean.replace(/(\d{2})(\d{0,5})/, '($1) $2');
      }
      setKeyValue(masked);
    } else if (keyType === 'EMAIL') {
      setKeyValue(val.trim().toLowerCase());
    } else {
      setKeyValue(val.trim());
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyValue.trim()) {
      toast.error('Informe a chave Pix para continuar.');
      return;
    }

    addMutation.mutate({
      type: keyType,
      key: keyValue.trim(),
      isDefault
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'CPF':
        return 'CPF';
      case 'CNPJ':
        return 'CNPJ';
      case 'PHONE':
        return 'Celular';
      case 'EMAIL':
        return 'E-mail';
      case 'EVP':
        return 'Aleatória (EVP)';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-3">
      {/* Header com Botão Adicionar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Chaves Pix para Saque ({pixKeys.length})
          </span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="h-7 text-xs border-teal-500/40 text-teal-400 hover:bg-teal-500/10 gap-1.5 px-2.5 rounded-lg"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Adicionar Chave</span>
        </Button>
      </div>

      {/* Lista de Chaves */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ) : pixKeys.length === 0 ? (
        <div className="p-4 rounded-xl bg-[#0B1120] border border-dashed border-slate-800 text-center space-y-2">
          <QrCode className="w-6 h-6 text-slate-500 mx-auto" />
          <p className="text-xs text-slate-400 font-medium">
            Nenhuma chave Pix cadastrada para transferências.
          </p>
          <p className="text-[11px] text-slate-500">
            Adicione uma chave para receber seus saques automáticos e avulsos.
          </p>
          <Button
            size="sm"
            variant="teal"
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="text-xs gap-1.5 mt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Primeira Chave</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {pixKeys.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                item.isDefault
                  ? 'bg-teal-950/20 border-teal-500/30'
                  : 'bg-[#0B1120] border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    item.isDefault
                      ? 'bg-teal-500/20 text-teal-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Key className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={item.isDefault ? 'teal' : 'neutral'}
                      size="sm"
                      className="text-[10px] uppercase font-semibold"
                    >
                      {getTypeLabel(item.type)}
                    </Badge>

                    {item.isDefault && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Principal de Saque
                      </span>
                    )}
                  </div>

                  <p className="font-mono text-xs font-semibold text-slate-200 truncate pt-0.5">
                    {item.key}
                  </p>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                {/* Copiar */}
                <button
                  type="button"
                  onClick={() => handleCopy(item.id, item.key)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  title="Copiar Chave Pix"
                  aria-label="Copiar Chave Pix"
                >
                  {copiedKeyId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-teal-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Tornar Principal */}
                {!item.isDefault && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setDefaultMutation.mutate(item.id)}
                    disabled={setDefaultMutation.isPending}
                    className="h-7 text-[11px] text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 gap-1 px-2"
                    title="Definir como chave principal para saques"
                  >
                    <Star className="w-3 h-3 text-slate-500 group-hover:text-teal-400" />
                    <span>Tornar principal</span>
                  </Button>
                )}

                {/* Apagar */}
                <button
                  type="button"
                  onClick={() => setKeyToDelete(item)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Apagar Chave Pix"
                  aria-label="Apagar Chave Pix"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL ADICIONAR CHAVE PIX */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title={
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-teal-400" />
            <span>Adicionar Chave Pix</span>
          </div>
        }
        description="Cadastre uma chave Pix para recebimento de transferências e saques."
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {/* Seleção do Tipo de Chave */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Tipo de Chave Pix
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  { type: 'CPF', label: 'CPF' },
                  { type: 'CNPJ', label: 'CNPJ' },
                  { type: 'PHONE', label: 'Celular' },
                  { type: 'EMAIL', label: 'E-mail' },
                  { type: 'EVP', label: 'Aleatória' }
                ] as const
              ).map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => {
                    setKeyType(opt.type);
                    setKeyValue('');
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    keyType === opt.type
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-sm'
                      : 'bg-[#0B1120] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campo Chave */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Chave Pix ({getTypeLabel(keyType)})
            </label>
            <input
              type={keyType === 'EMAIL' ? 'email' : 'text'}
              value={keyValue}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder={
                keyType === 'CPF'
                  ? '000.000.000-00'
                  : keyType === 'CNPJ'
                  ? '00.000.000/0000-00'
                  : keyType === 'PHONE'
                  ? '(00) 00000-0000'
                  : keyType === 'EMAIL'
                  ? 'seu@email.com'
                  : 'Cole sua chave aleatória (EVP)'
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1120] border border-slate-800 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-teal-500 transition-colors"
              autoFocus
              required
            />
            <p className="text-[11px] text-slate-500">
              {keyType === 'CPF' && 'Informe os 11 dígitos do CPF cadastrado no seu banco.'}
              {keyType === 'CNPJ' && 'Informe os 14 dígitos do CNPJ da sua empresa.'}
              {keyType === 'PHONE' && 'Informe DDD + número de celular com 9 dígitos.'}
              {keyType === 'EMAIL' && 'Informe o e-mail completo vinculado à sua chave Pix.'}
              {keyType === 'EVP' && 'Cole o código UUID de 32 caracteres da sua chave aleatória.'}
            </p>
          </div>

          {/* Checkbox Chave Principal */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0B1120] border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={isDefault || pixKeys.length === 0}
              disabled={pixKeys.length === 0}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-teal-500 focus:ring-teal-500/20 bg-slate-900"
            />
            <div className="space-y-0.5 text-xs">
              <span className="font-semibold text-slate-200">
                Definir como chave principal para saques
              </span>
              <p className="text-[11px] text-slate-400">
                {pixKeys.length === 0
                  ? 'Esta será sua chave principal automática para saques semanais e avulsos.'
                  : 'Os saques automáticos de segunda-feira e antecipados serão transferidos para esta chave.'}
              </p>
            </div>
          </label>

          {/* Botões do Modal */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
              disabled={addMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="teal"
              size="sm"
              disabled={addMutation.isPending}
              className="gap-1.5"
            >
              {addMutation.isPending ? 'Salvando...' : 'Salvar Chave Pix'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL CONFIRMAR EXCLUSÃO */}
      <Modal
        isOpen={Boolean(keyToDelete)}
        onClose={() => setKeyToDelete(null)}
        title={
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>Excluir Chave Pix</span>
          </div>
        }
        description="Confirmação de remoção de dados bancários."
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Tem certeza que deseja apagar a chave Pix{' '}
            <strong className="font-mono text-white font-bold">{keyToDelete?.key}</strong>?
          </p>

          {keyToDelete?.isDefault && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Esta é a sua chave principal
              </span>
              <p className="text-[11px] text-amber-200/80">
                Ao apagá-la, outra chave cadastrada será promovida a principal automaticamente para que seus saques não fiquem bloqueados.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setKeyToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => keyToDelete && deleteMutation.mutate(keyToDelete.id)}
              disabled={deleteMutation.isPending}
              className="gap-1.5 bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending ? 'Apagando...' : 'Sim, Apagar Chave'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
