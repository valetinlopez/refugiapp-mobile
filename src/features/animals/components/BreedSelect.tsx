import type { LayoutChangeEvent } from 'react-native';

import type { Species } from '../types';
import type { CatalogStatus } from '../utils/speciesCatalog';

import { CatalogRadioField } from './CatalogRadioField';
import { FormField, FormTextInput } from './formFields';

export interface BreedSelectProps {
  disabled?: boolean;
  error: string | undefined;
  onChange(value: string): void;
  onLayout?: (event: LayoutChangeEvent) => void;
  onRetry?: () => void;
  options: { label: string; value: string }[];
  species: Species | undefined;
  status: CatalogStatus;
  value: string | undefined;
}

export function BreedSelect({
  disabled = false,
  error,
  onChange,
  onLayout,
  onRetry,
  options,
  species,
  status,
  value,
}: BreedSelectProps) {
  if (species === undefined) {
    return (
      <FormField error={error} label="Raza" {...(onLayout ? { onLayout } : {})}>
        <FormTextInput
          accessibilityLabel="Raza"
          autoCapitalize="words"
          autoComplete="off"
          editable={!disabled}
          maxLength={80}
          onChangeText={onChange}
          placeholder="Mestizo (opcional)"
          value={value ?? ''}
        />
      </FormField>
    );
  }

  return (
    <CatalogRadioField
      disabled={disabled}
      error={error}
      label="Raza"
      maxLength={80}
      onChange={onChange}
      {...(onLayout ? { onLayout } : {})}
      {...(onRetry ? { onRetry } : {})}
      options={options}
      optional
      placeholder="Seleccioná una raza"
      status={status}
      textAccessibilityLabel="Raza (otra)"
      textPlaceholder="Escribí la raza"
      value={value}
    />
  );
}
