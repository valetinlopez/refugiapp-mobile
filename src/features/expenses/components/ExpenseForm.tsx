import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type ComponentProps, type ReactNode, type Ref } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppButton, AppCard, AppIcon, AppText } from '@/components/primitives';
import { DateTimeField, SectionHeader, toLocalDateTimeIso } from '@/components/patterns';
import { colors, fontFamilies, radii, sizes, spacing } from '@/theme';

import type { AnimalOption, ReceiptFile } from '../types';
import {
  EXPENSE_DESCRIPTION_MAX_LENGTH,
  expenseSchema,
  type ExpenseFormInput,
  type ExpenseFormValues,
} from '../utils/expenseSchema';
import { formatArsUnitsPreview } from '../utils/expenseAmount';
import { ExpenseCategoryField, ExpenseAnimalField } from './ExpensePickerFields';
import { ExpenseReceiptPicker } from './ExpenseReceiptPicker';

export function ExpenseForm({
  animalOptions,
  errorMessage,
  initialAnimalId,
  isSubmitting,
  onCancel,
  onCancelUpload,
  onSubmit,
  uploadProgress,
}: {
  animalOptions: AnimalOption[];
  errorMessage?: string | null;
  initialAnimalId?: string;
  isSubmitting: boolean;
  onCancel(): void;
  onCancelUpload(): void;
  onSubmit(values: ExpenseFormValues, receipt: ReceiptFile | null): void;
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
      amountUnits: '',
      incurredAt: toLocalDateTimeIso(new Date()),
    },
    mode: 'onTouched',
  });
  const amountUnits = useWatch({ control, name: 'amountUnits', defaultValue: '' });
  const amountPreview = formatArsUnitsPreview(amountUnits);

  const submit = handleSubmit((values) => {
    setReceiptError(null);
    onSubmit(values, receipt);
  });

  return (
    <View style={styles.form}>
      <AppCard style={styles.card} variant="elevated">
        <SectionHeader
          subtitle="Completá los datos del gasto para llevarlo a la cuenta."
          title="Datos del gasto"
        />
        <Controller
          control={control}
          name="animalId"
          render={({ field, fieldState }) => (
            <Field error={fieldState.error?.message} label="Animal *">
              <ExpenseAnimalField
                animals={animalOptions}
                disabled={isSubmitting}
                onChange={field.onChange}
                value={field.value}
              />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="category"
          render={({ field, fieldState }) => (
            <Field error={fieldState.error?.message} label="Categoría *">
              <ExpenseCategoryField
                disabled={isSubmitting}
                onChange={field.onChange}
                value={field.value}
              />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="amountUnits"
          render={({ field, fieldState }) => (
            <Field
              error={fieldState.error?.message}
              label="Importe *"
              action={
                amountPreview ? (
                  <AppText color="positive" variant="label">
                    {amountPreview}
                  </AppText>
                ) : undefined
              }
            >
              <View style={styles.amountRow}>
                <Input
                  accessibilityLabel="Importe"
                  accessibilityHint="Ingresá el importe en pesos; se convertirá a centavos al guardar"
                  editable={!isSubmitting}
                  inputMode="decimal"
                  keyboardType="decimal-pad"
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  placeholder="0,00"
                  returnKeyType="next"
                  style={styles.amountInput}
                  value={field.value}
                />
                <CurrencyField disabled={isSubmitting} value="ARS" />
              </View>
              <View style={styles.hint}>
                <AppIcon color="info" name="info" size={16} />
                <AppText color="textSecondary" style={styles.hintText} variant="caption">
                  Ingresá el importe en unidades; se convertirá a centavos al guardar.
                </AppText>
              </View>
            </Field>
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <Field
              action={
                <AppText color="textSecondary" variant="caption">
                  {String(field.value.length)}/{EXPENSE_DESCRIPTION_MAX_LENGTH}
                </AppText>
              }
              error={fieldState.error?.message}
              label="Descripción *"
            >
              <Input
                accessibilityLabel="Descripción"
                autoCapitalize="sentences"
                autoComplete="off"
                editable={!isSubmitting}
                maxLength={EXPENSE_DESCRIPTION_MAX_LENGTH}
                multiline
                numberOfLines={4}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="Ej. Vacuna antirrábica"
                returnKeyType="default"
                style={styles.multiline}
                textAlignVertical="top"
                value={field.value}
              />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="incurredAt"
          render={({ field, fieldState }) => (
            <Field error={fieldState.error?.message} label="Fecha y hora *">
              <DateTimeField
                accessibilityLabel="Fecha y hora del gasto"
                disabled={isSubmitting}
                mode="datetime"
                onChange={field.onChange}
                value={field.value}
              />
            </Field>
          )}
        />
      </AppCard>

      <AppCard style={styles.card} variant="elevated">
        <SectionHeader
          subtitle="Podés adjuntar un archivo o tomar una fotografía."
          title="Comprobante (opcional)"
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
      </AppCard>

      {errorMessage ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {errorMessage}
        </AppText>
      ) : null}
      <View style={styles.actions}>
        <AppButton
          disabled={isSubmitting}
          label="Cancelar"
          onPress={onCancel}
          style={styles.actionButton}
          variant="secondary"
        />
        <AppButton
          label="Registrar gasto"
          loading={isSubmitting}
          onPress={() => void submit()}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
}

function CurrencyField({ disabled, value }: { disabled: boolean; value: string }) {
  return (
    <View
      accessibilityLabel={'Moneda: ' + value}
      accessibilityRole="text"
      accessibilityState={{ disabled }}
      style={styles.currency}
    >
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

function Field({
  action,
  children,
  error,
  label,
}: {
  action?: ReactNode;
  children: ReactNode;
  error: string | undefined;
  label: string;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldHeader}>
        <AppText variant="label">{label}</AppText>
        {action}
      </View>
      {children}
      {error ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

function Input({
  ref,
  style,
  ...props
}: ComponentProps<typeof TextInput> & { ref?: Ref<TextInput> }) {
  return (
    <TextInput
      placeholderTextColor={colors.textSecondary}
      ref={ref}
      style={[styles.input, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  actionButton: { flex: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  amountInput: { flex: 1, minWidth: 120 },
  amountRow: { flexDirection: 'row', gap: spacing.sm },
  card: { gap: spacing.md },
  currency: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: sizes.buttonHeight,
    minWidth: 96,
    paddingHorizontal: spacing.md,
  },
  field: { gap: spacing.xs },
  fieldHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  form: { gap: spacing.md, width: '100%' },
  hint: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.xs },
  hintText: { flex: 1, minWidth: 0 },
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
  multiline: { minHeight: 112 },
});
