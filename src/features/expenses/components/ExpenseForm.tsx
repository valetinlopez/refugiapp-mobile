import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { colors, fontFamilies, radii, sizes, spacing } from '@/theme';

import type { AnimalOption, ExpenseCategory, ReceiptFile } from '../types';
import {
  expenseSchema,
  type ExpenseFormInput,
  type ExpenseFormValues,
} from '../utils/expenseSchema';
import { ExpenseReceiptPicker } from './ExpenseReceiptPicker';

const labels: Record<ExpenseCategory, string> = {
  food: 'Alimento',
  medicine: 'Medicación',
  veterinary: 'Veterinaria',
  supplies: 'Insumos',
  transport: 'Transporte',
  other: 'Otro',
};

export function ExpenseForm({
  animalOptions,
  errorMessage,
  initialAnimalId,
  isSubmitting,
  onCancelUpload,
  onSubmit,
  uploadProgress,
}: {
  animalOptions: AnimalOption[];
  errorMessage?: string | null;
  initialAnimalId?: string;
  isSubmitting: boolean;
  onCancelUpload(): void;
  onSubmit(values: ExpenseFormValues, receipt: ReceiptFile): void;
  uploadProgress: number | null;
}) {
  const [receipt, setReceipt] = useState<ReceiptFile | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const { control, handleSubmit } = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      animalId: initialAnimalId ?? '',
      category: 'other',
      description: '',
      amountCents: '',
      incurredAt: new Date().toISOString().slice(0, 10),
    },
  });

  const submit = handleSubmit((values) => {
    if (!receipt) {
      setReceiptError('Adjuntá un comprobante.');
      return;
    }
    setReceiptError(null);
    onSubmit(values, receipt);
  });

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="animalId"
        render={({ field, fieldState }) => (
          <Field label="Animal" error={fieldState.error?.message}>
            <View accessibilityRole="radiogroup" style={styles.options}>
              {animalOptions.map((animal) => (
                <Option
                  key={animal.id}
                  label={animal.name}
                  selected={field.value === animal.id}
                  disabled={isSubmitting}
                  onPress={() => field.onChange(animal.id)}
                />
              ))}
            </View>
          </Field>
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <Field label="Concepto" error={fieldState.error?.message}>
            <Input
              accessibilityLabel="Concepto"
              editable={!isSubmitting}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Ej. Vacuna antirrábica"
              value={field.value}
            />
          </Field>
        )}
      />
      <Controller
        control={control}
        name="category"
        render={({ field, fieldState }) => (
          <Field label="Categoría" error={fieldState.error?.message}>
            <View accessibilityRole="radiogroup" style={styles.options}>
              {Object.entries(labels).map(([value, label]) => (
                <Option
                  key={value}
                  label={label}
                  selected={field.value === value}
                  disabled={isSubmitting}
                  onPress={() => field.onChange(value)}
                />
              ))}
            </View>
          </Field>
        )}
      />
      <Controller
        control={control}
        name="amountCents"
        render={({ field, fieldState }) => (
          <Field label="Importe en centavos" error={fieldState.error?.message}>
            <Input
              accessibilityLabel="Importe en centavos"
              editable={!isSubmitting}
              keyboardType="number-pad"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="1250"
              value={field.value}
            />
          </Field>
        )}
      />
      <Controller
        control={control}
        name="incurredAt"
        render={({ field, fieldState }) => (
          <Field label="Fecha" error={fieldState.error?.message}>
            <Input
              accessibilityLabel="Fecha"
              editable={!isSubmitting}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="AAAA-MM-DD"
              value={field.value}
            />
          </Field>
        )}
      />
      <ExpenseReceiptPicker
        disabled={isSubmitting}
        onChange={(file) => {
          setReceipt(file);
          if (file) setReceiptError(null);
        }}
        value={receipt}
      />
      {receiptError ? (
        <AppText color="danger" role="alert">
          {receiptError}
        </AppText>
      ) : null}
      {uploadProgress !== null ? (
        <View>
          <AppText accessibilityLiveRegion="polite">
            Subiendo comprobante: {Math.round(uploadProgress * 100)}%
          </AppText>
          <AppButton label="Cancelar subida" onPress={onCancelUpload} variant="secondary" />
        </View>
      ) : null}
      {errorMessage ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {errorMessage}
        </AppText>
      ) : null}
      <AppButton label="Registrar gasto" loading={isSubmitting} onPress={() => void submit()} />
    </View>
  );
}

function Field({
  children,
  error,
  label,
}: {
  children: ReactNode;
  error: string | undefined;
  label: string;
}) {
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      {children}
      {error ? (
        <AppText color="danger" role="alert">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
function Input(props: ComponentProps<typeof TextInput>) {
  return <TextInput placeholderTextColor={colors.textSecondary} style={styles.input} {...props} />;
}
function Option({
  disabled,
  label,
  onPress,
  selected,
}: {
  disabled: boolean;
  label: string;
  onPress(): void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.option, selected && styles.selected]}
    >
      <AppText>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  form: { gap: spacing.md, width: '100%' },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.textPrimary,
    fontFamily: fontFamilies.body,
    fontSize: 16,
    minHeight: sizes.buttonHeight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  option: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  options: { gap: spacing.xs },
  selected: { borderColor: colors.positive },
});
