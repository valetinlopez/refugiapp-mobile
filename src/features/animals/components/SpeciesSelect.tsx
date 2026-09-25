import type { LayoutChangeEvent } from 'react-native';

import type { CatalogStatus } from '../utils/speciesCatalog';

import { CatalogRadioField } from './CatalogRadioField';

export interface SpeciesSelectProps {
  disabled?: boolean;
  error: string | undefined;
  onChange(value: string): void;
  onLayout?: (event: LayoutChangeEvent) => void;
  onRetry?: () => void;
  options: { label: string; value: string }[];
  status: CatalogStatus;
  value: string | undefined;
}

export function SpeciesSelect({
  disabled = false,
  error,
  onChange,
  onLayout,
  onRetry,
  options,
  status,
  value,
}: SpeciesSelectProps) {
  return (
    <CatalogRadioField
      disabled={disabled}
      error={error}
      label="Especie"
      maxLength={80}
      onChange={onChange}
      {...(onLayout ? { onLayout } : {})}
      {...(onRetry ? { onRetry } : {})}
      options={options}
      placeholder="Seleccioná una especie"
      status={status}
      textAccessibilityLabel="Especie (otra)"
      textPlaceholder="Escribí la especie"
      value={value}
    />
  );
}
