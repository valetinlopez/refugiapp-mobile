import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { localDayStart } from '@/core/validation';
import { AppButton, AppCard, AppIcon, AppText } from '@/components/primitives';
import { DateTimeField, SectionHeader } from '@/components/patterns';
import { colors, spacing } from '@/theme';

import type { CreateAnimalHistoryEventRequest } from '../types';
import {
  ANIMAL_EVENT_FUTURE_TOLERANCE_MS,
  createAnimalEventSchema,
  type CreateAnimalEventFormInput,
} from '../utils/createAnimalEventSchema';
import { FormField, FormTextInput } from './AnimalProfileForm';
import { AnimalEventTypeField } from './AnimalEventTypeField';

interface CreateAnimalEventFormProps {
  animalName: string;
  errorMessage?: string | null;
  intakeDate: string;
  isSubmitting?: boolean;
  onCancel(): void;
  onSubmit(event: CreateAnimalHistoryEventRequest): void;
}

export function CreateAnimalEventForm({
  animalName,
  errorMessage,
  intakeDate,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: CreateAnimalEventFormProps) {
  const [maximumOccurredAt] = useState(
    () => new Date(Date.now() + ANIMAL_EVENT_FUTURE_TOLERANCE_MS)
  );
  const minimumOccurredAt = localDayStart(intakeDate);
  const { control, handleSubmit } = useForm<CreateAnimalEventFormInput>({
    resolver: zodResolver(createAnimalEventSchema(intakeDate)),
    defaultValues: {
      eventType: 'general_note',
      description: '',
      occurredAt: '',
    },
    mode: 'onTouched',
  });

  return (
    <AppCard style={styles.card} variant="elevated">
      <SectionHeader
        subtitle="Contá qué pasó y, si lo sabés, cuándo."
        title="Información del evento"
      />

      <View style={styles.fields}>
        <Controller
          control={control}
          name="eventType"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Tipo de evento">
              <AnimalEventTypeField
                disabled={isSubmitting}
                onChange={field.onChange}
                value={field.value}
              />
            </FormField>
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
                testID="create-event-description"
                value={field.value}
              />
              <AppText
                accessibilityLiveRegion="polite"
                color="textSecondary"
                style={styles.counter}
                variant="caption"
              >
                {field.value.length}/1000
              </AppText>
            </FormField>
          )}
        />

        <Controller
          control={control}
          name="occurredAt"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Fecha y hora (opcional)">
              <DateTimeField
                accessibilityHint="Por defecto se registra el momento actual"
                accessibilityLabel="Fecha y hora"
                disabled={isSubmitting}
                {...(minimumOccurredAt ? { minimumDate: minimumOccurredAt } : {})}
                maximumDate={maximumOccurredAt}
                mode="datetime"
                onChange={field.onChange}
                optional
                value={field.value ?? ''}
              />
            </FormField>
          )}
        />

        <View style={styles.notice}>
          <AppIcon color="info" name="info" size={20} />
          <AppText color="textSecondary" style={styles.noticeText} variant="caption">
            La fecha no puede ser futura ni anterior al ingreso de {animalName}. Si la dejás vacía,
            se registra la fecha y hora actual.
          </AppText>
        </View>
      </View>

      {errorMessage ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {errorMessage}
        </AppText>
      ) : null}

      <View style={styles.footer}>
        <AppButton
          disabled={isSubmitting}
          label="Cancelar"
          onPress={onCancel}
          testID="create-event-cancel"
          variant="secondary"
        />
        <AppButton
          label="Guardar evento"
          loading={isSubmitting}
          onPress={() =>
            void handleSubmit((rawValues) => {
              const values = createAnimalEventSchema(intakeDate).parse(rawValues);
              const event: CreateAnimalHistoryEventRequest = {
                eventType: values.eventType,
                description: values.description,
                ...(values.occurredAt === undefined ? {} : { occurredAt: values.occurredAt }),
              };
              onSubmit(event);
            })()
          }
          testID="create-event-submit"
        />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  counter: {
    textAlign: 'right',
  },
  description: {
    minHeight: 128,
  },
  fields: {
    gap: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  notice: {
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    borderRadius: spacing.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  noticeText: {
    flex: 1,
    minWidth: 0,
  },
});
