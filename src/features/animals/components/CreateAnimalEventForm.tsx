import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { DateTimeField } from '@/components/patterns';
import { spacing } from '@/theme';

import type { CreateAnimalHistoryEventRequest, ManualAnimalHistoryEventType } from '../types';
import {
  ANIMAL_EVENT_FUTURE_TOLERANCE_MS,
  createAnimalEventSchema,
  type CreateAnimalEventFormInput,
} from '../utils/createAnimalEventSchema';
import { FormField, FormTextInput, OptionGroup } from './AnimalProfileForm';

export const ANIMAL_EVENT_TYPE_OPTIONS: {
  label: string;
  value: ManualAnimalHistoryEventType;
}[] = [
  { label: 'Nota general', value: 'general_note' },
  { label: 'Nota de comportamiento', value: 'behavior_note' },
  { label: 'Traslado', value: 'transfer' },
];

interface CreateAnimalEventFormProps {
  errorMessage?: string | null;
  isSubmitting?: boolean;
  onSubmit(event: CreateAnimalHistoryEventRequest): void;
}

export function CreateAnimalEventForm({
  errorMessage,
  isSubmitting = false,
  onSubmit,
}: CreateAnimalEventFormProps) {
  const [maximumOccurredAt] = useState(
    () => new Date(Date.now() + ANIMAL_EVENT_FUTURE_TOLERANCE_MS)
  );
  const { control, handleSubmit } = useForm<CreateAnimalEventFormInput>({
    resolver: zodResolver(createAnimalEventSchema),
    defaultValues: {
      eventType: 'general_note',
      description: '',
      occurredAt: '',
    },
    mode: 'onTouched',
  });

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="eventType"
        render={({ field, fieldState }) => (
          <OptionGroup
            disabled={isSubmitting}
            error={fieldState.error?.message}
            label="Tipo de evento"
            onChange={field.onChange}
            options={ANIMAL_EVENT_TYPE_OPTIONS}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <FormField error={fieldState.error?.message} label="Descripción">
            <FormTextInput
              accessibilityLabel="Descripción"
              autoCapitalize="sentences"
              autoComplete="off"
              editable={!isSubmitting}
              maxLength={1000}
              multiline
              numberOfLines={5}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Describe el evento"
              style={styles.description}
              textAlignVertical="top"
              value={field.value}
            />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="occurredAt"
        render={({ field, fieldState }) => (
          <FormField error={fieldState.error?.message} label="Fecha y hora">
            <DateTimeField
              accessibilityLabel="Fecha y hora"
              disabled={isSubmitting}
              maximumDate={maximumOccurredAt}
              mode="datetime"
              onChange={field.onChange}
              optional
              value={field.value ?? ''}
            />
            <AppText color="textSecondary" variant="caption">
              Si la dejás vacía, se registrará la fecha y hora actual.
            </AppText>
          </FormField>
        )}
      />
      {errorMessage ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {errorMessage}
        </AppText>
      ) : null}
      <AppButton
        label="Registrar evento"
        loading={isSubmitting}
        onPress={() =>
          void handleSubmit((rawValues) => {
            const values = createAnimalEventSchema.parse(rawValues);
            const event: CreateAnimalHistoryEventRequest = {
              eventType: values.eventType,
              description: values.description,
              ...(values.occurredAt === undefined ? {} : { occurredAt: values.occurredAt }),
            };
            onSubmit(event);
          })()
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  description: {
    minHeight: 128,
  },
  form: {
    gap: spacing.md,
    width: '100%',
  },
});
