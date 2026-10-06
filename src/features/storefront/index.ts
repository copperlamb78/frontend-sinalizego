/**
 * Ponto de exportação pública (Barreira Pública) do módulo Storefront
 * Proibido deep import para arquivos internos deste módulo.
 */

// Componentes - Passo 1 (Vitrine)
export { StorefrontView } from './components/StorefrontView';
export { StorefrontHeader } from './components/StorefrontHeader';
export { StorefrontServiceCard } from './components/StorefrontServiceCard';
export { StorefrontCategoryTabs } from './components/StorefrontCategoryTabs';
export { StorefrontServiceList } from './components/StorefrontServiceList';
export { StorefrontSkeleton } from './components/StorefrontSkeleton';
export { StorefrontErrorState } from './components/StorefrontErrorState';

// Componentes - Passo 2 (Seleção de Data & Horário)
export { BookingStepTwoView } from './components/BookingStepTwoView';
export { BookingSelectedServiceCard } from './components/BookingSelectedServiceCard';
export { BookingDateCarousel } from './components/BookingDateCarousel';
export { BookingSlotGrid } from './components/BookingSlotGrid';
export { BookingBottomBar } from './components/BookingBottomBar';
export type { BookingSelectionData } from './components/BookingStepTwoView';

// Hooks
export { useStorefront } from './hooks/useStorefront';
export { useAvailableSlots } from './hooks/useAvailableSlots';

// Serviços
export { storefrontService } from './services/storefrontService';

// Tipos
export type {
  StorefrontCompany,
  StorefrontService,
  StorefrontServiceGroup,
  StorefrontWorkingHour,
  AvailableSlotsResponse,
  AvailableSlotsParams,
} from './types/storefront.types';
