import React, { useState } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { Button } from '@/design-system';

interface BarbershopSearchBarProps {
  onSearch: (filters: { search?: string; district?: string }) => void;
  isLoading?: boolean;
}

export const BarbershopSearchBar: React.FC<BarbershopSearchBarProps> = ({
  onSearch,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');

  const quickDistricts = ['Todos', 'Asa Sul', 'Águas Claras', 'Sé', 'SIM'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      search: searchTerm.trim() || undefined,
      district: selectedDistrict && selectedDistrict !== 'Todos' ? selectedDistrict : undefined,
    });
  };

  const handleDistrictClick = (district: string) => {
    const newDistrict = district === selectedDistrict ? '' : district;
    setSelectedDistrict(newDistrict);
    onSearch({
      search: searchTerm.trim() || undefined,
      district: newDistrict && newDistrict !== 'Todos' ? newDistrict : undefined,
    });
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedDistrict('');
    onSearch({});
  };

  return (
    <div className="space-y-3" data-testid="barbershop-search-bar">
      {/* 1. CAIXA INTEGRADA DE PESQUISA (ESTILO MINIMALISTA AIRBNB/LINEAR) */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-stretch bg-surface border border-border rounded-xl shadow-xs overflow-hidden transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20"
      >
        {/* Campo de Busca por Nome / Serviço */}
        <div className="flex-1 flex items-center px-4 py-3 gap-2.5">
          <Search className="h-4 w-4 text-text-muted shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por barbearia, corte degradê, barba..."
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
            data-testid="input-search-term"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="p-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Divisor Visível em Telas Maiores */}
        <div className="hidden sm:block w-px bg-border my-2" />

        {/* Campo de Filtro por Bairro/Região */}
        <div className="flex items-center px-4 py-2 sm:py-0 border-t sm:border-t-0 border-border gap-2 sm:w-60">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <input
            type="text"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            placeholder="Bairro ou Cidade..."
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
            data-testid="input-search-district"
          />
        </div>

        {/* Botão de Busca */}
        <div className="p-2 sm:p-1.5 flex items-center justify-end">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            className="w-full sm:w-auto font-bold text-xs h-10 px-6 shadow-xs"
            data-testid="btn-submit-search"
          >
            Buscar
          </Button>
        </div>
      </form>

      {/* 2. PILLS DE FILTROS RÁPIDOS POR BAIRRO */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
        <span className="text-text-muted font-semibold text-[11px] uppercase tracking-wider shrink-0 mr-1">
          Regiões:
        </span>
        {quickDistricts.map((district) => {
          const isSelected =
            (district === 'Todos' && !selectedDistrict) || selectedDistrict === district;

          return (
            <button
              key={district}
              type="button"
              onClick={() => handleDistrictClick(district)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150 shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-raised'
              }`}
            >
              {district}
            </button>
          );
        })}

        {(searchTerm || selectedDistrict) && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-text-muted hover:text-danger ml-2 transition-colors cursor-pointer"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
};
