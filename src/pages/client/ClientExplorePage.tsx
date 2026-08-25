import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { appointmentsService } from '@/services/appointments.service';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Skeleton } from '@/components/common/Skeleton';
import {
  Compass,
  Search,
  MapPin,
  Calendar,
  ArrowRight,
  Store,
  Scissors
} from 'lucide-react';

export const ClientExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [slugSearch, setSlugSearch] = useState('');

  // 1. Fetch User Appointments
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['user-appointments-explore'],
    queryFn: () => appointmentsService.getUserAppointments()
  });

  // 2. Extract unique visited establishments, memoized to only recalculate when appointments change
  const uniqueCompanies = React.useMemo(() => {
    const visitedCompaniesMap = new Map<string, {
      id: string;
      businessName: string;
      slug: string;
      providerType: string;
      address: string;
      logoPhoto?: string | null;
      bannerPhoto?: string | null;
      lastVisitDate: string;
      lastServiceName: string;
      totalVisits: number;
    }>();

    if (appointments && Array.isArray(appointments)) {
      appointments.forEach((apt) => {
        if (apt.company) {
          const existing = visitedCompaniesMap.get(apt.company.id);
          const address = [
            apt.company.street,
            apt.company.number,
            apt.company.district,
            apt.company.city ? `${apt.company.city}/${apt.company.state}` : ''
          ].filter(Boolean).join(', ');

          if (!existing) {
            visitedCompaniesMap.set(apt.company.id, {
              id: apt.company.id,
              businessName: apt.company.businessName,
              slug: apt.company.slug || 'vintage-club',
              providerType: apt.company.providerType || 'Barbearia',
              address: address || 'Endereço não informado',
              logoPhoto: apt.company.logoPhoto,
              bannerPhoto: apt.company.bannerPhoto,
              lastVisitDate: apt.appointmentDate,
              lastServiceName: apt.service?.name || 'Atendimento',
              totalVisits: 1
            });
          } else {
            existing.totalVisits += 1;
            if (new Date(apt.appointmentDate) > new Date(existing.lastVisitDate)) {
              existing.lastVisitDate = apt.appointmentDate;
              existing.lastServiceName = apt.service?.name || existing.lastServiceName;
            }
          }
        }
      });
    }

    return Array.from(visitedCompaniesMap.values());
  }, [appointments]);

  // 3. Filter unique establishments based on search query
  const visitedCompanies = React.useMemo(() => {
    if (!searchQuery) return uniqueCompanies;

    const query = searchQuery.toLowerCase();
    return uniqueCompanies.filter((c) =>
      c.businessName.toLowerCase().includes(query) ||
      c.address.toLowerCase().includes(query)
    );
  }, [uniqueCompanies, searchQuery]);

  const handleSlugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (slugSearch.trim()) {
      navigate(`/empresa/${slugSearch.trim().toLowerCase()}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="space-y-1 text-center max-w-xl mx-auto">
        <h1 className="text-2xl font-black text-white flex items-center justify-center gap-2">
          <Compass className="w-6 h-6 text-teal-400" />
          <span>Barbearias e Salões Visitados</span>
        </h1>
        <p className="text-xs text-slate-400">
          Acesse rapidamente o catálogo dos estabelecimentos que você já frequentou para agendar novamente com facilidade.
        </p>
      </div>

      {/* Visited Establishments List */}
      {visitedCompanies.length > 0 ? (
        <div className="space-y-6">
          {/* Search among visited (Centered) */}
          <div className="max-w-md mx-auto">
            <Input
              placeholder="Filtrar meus estabelecimentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="h-10 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visitedCompanies.map((comp) => {
              const formattedDate = new Date(comp.lastVisitDate).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });

              return (
                <Card
                  key={comp.id}
                  hoverEffect
                  className="p-5 bg-[#0F172A] border-slate-800 flex flex-col justify-between space-y-4 shadow-lg"
                >
                  <div className="space-y-3">
                    {/* Top: Logo & Name */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#1E293B] border border-teal-500/30 flex items-center justify-center overflow-hidden shrink-0">
                        {comp.logoPhoto ? (
                          <img
                            src={comp.logoPhoto}
                            alt={comp.businessName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Store className="w-6 h-6 text-teal-400" />
                        )}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base font-bold text-white truncate">
                            {comp.businessName}
                          </h2>
                          <Badge variant="teal" size="sm">
                            {comp.providerType}
                          </Badge>
                        </div>

                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{comp.address}</span>
                        </p>
                      </div>
                    </div>

                    {/* Last Service & Date Badge */}
                    <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1">
                          <Scissors className="w-3.5 h-3.5 text-teal-400" />
                          {comp.lastServiceName}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formattedDate}
                        </span>
                      </div>
                      <div className="text-[11px] text-teal-400 font-semibold">
                        {comp.totalVisits} {comp.totalVisits === 1 ? 'atendimento realizado' : 'atendimentos realizados'}
                      </div>
                    </div>
                  </div>

                  {/* Action: Book Again */}
                  <Link to={`/empresa/${comp.slug}`}>
                    <Button
                      size="sm"
                      className="w-full font-bold text-xs shadow-md shadow-teal-500/10 cursor-pointer"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Agendar Novamente
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty State: User hasn't visited any establishment yet */
        <div className="p-10 text-center bg-[#0F172A] border border-slate-800 rounded-3xl space-y-6 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#1E293B] border border-slate-700 flex items-center justify-center mx-auto text-teal-400">
            <Compass className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">
              Nenhuma barbearia visitada ainda
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quando você agendar e concluir seu primeiro atendimento, suas barbearias favoritas aparecerão aqui para você agendar novamente com apenas 1 clique.
            </p>
          </div>

          {/* Quick link finder */}
          <form onSubmit={handleSlugSubmit} className="space-y-3 pt-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Conhece o link de um estabelecimento?
            </span>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: vintage-club"
                value={slugSearch}
                onChange={(e) => setSlugSearch(e.target.value)}
                leftIcon={<Store className="w-4 h-4 text-slate-400" />}
                className="h-11 text-xs"
              />
              <Button type="submit" size="sm" className="shrink-0 h-11 px-4 text-xs font-bold">
                Acessar
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
