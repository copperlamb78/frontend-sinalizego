import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent } from '@/design-system';
import { AlertCircle, Home, Store } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-surface border-border text-center shadow-lg">
        <CardContent className="p-8 space-y-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center text-danger">
            <AlertCircle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
              404
            </h1>
            <h2 className="text-base font-bold text-text-primary">
              Página Não Encontrada
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              O endereço ou estabelecimento que você tentou acessar não foi localizado ou não existe mais.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Home className="h-4 w-4" />}
                className="w-full"
              >
                Início
              </Button>
            </Link>

            <Link to="/empresa/barbers-club" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Store className="h-4 w-4" />}
                className="w-full"
              >
                Ver Vitrine Demo
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;
