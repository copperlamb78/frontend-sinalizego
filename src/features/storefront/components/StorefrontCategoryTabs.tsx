import React from 'react';
import { Button } from '@/design-system/ui/button';
import type { StorefrontServiceGroup } from '../types/storefront.types';

interface StorefrontCategoryTabsProps {
  groups: StorefrontServiceGroup[];
  selectedGroupId: string | null; // null = "Todos"
  onSelectGroup: (groupId: string | null) => void;
}

export const StorefrontCategoryTabs: React.FC<StorefrontCategoryTabsProps> = ({
  groups,
  selectedGroupId,
  onSelectGroup,
}) => {
  // Se houver apenas 1 grupo ou nenhum, não precisa renderizar as abas
  if (groups.length <= 1) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2" data-testid="service-category-tabs">
      <div className="flex items-center gap-2 min-w-max">
        {/* Aba "Todos" */}
        <Button
          variant={selectedGroupId === null ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onSelectGroup(null)}
          data-testid="tab-all-services"
          className="text-xs"
        >
          Todos
        </Button>

        {/* Abas dinâmicas dos grupos cadastrados na API */}
        {groups.map((group) => {
          const isSelected = selectedGroupId === group.id;
          return (
            <Button
              key={group.id}
              variant={isSelected ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => onSelectGroup(group.id)}
              data-testid={`tab-group-${group.id}`}
              className="text-xs"
            >
              {group.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
