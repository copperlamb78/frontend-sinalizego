import { useAuth } from '@/contexts/auth.context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { User, Mail, Phone, CreditCard } from 'lucide-react';

export const ClientProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#F8FAFC]">Minha Conta</h1>
        <p className="text-sm text-[#94A3B8]">
          Gerencie seus dados pessoais, telefone de contato e chave Pix
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados Pessoais</CardTitle>
          <CardDescription>
            Informações utilizadas para emissão de voucher e confirmações por WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nome Completo"
            defaultValue={user?.name || ''}
            leftIcon={<User className="w-4 h-4" />}
          />
          <Input
            label="E-mail"
            type="email"
            defaultValue={user?.email || ''}
            disabled
            leftIcon={<Mail className="w-4 h-4" />}
            helperText="O e-mail é a chave primária de acesso da sua conta"
          />
          <Input
            label="Telefone / WhatsApp"
            defaultValue={user?.phone || ''}
            leftIcon={<Phone className="w-4 h-4" />}
          />
          <Input
            label="CPF (Obrigatório para estorno Pix)"
            placeholder="000.000.000-00"
            defaultValue={user?.cpfCnpj || ''}
            leftIcon={<CreditCard className="w-4 h-4" />}
          />

          <div className="pt-2">
            <Button>Salvar Alterações</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
