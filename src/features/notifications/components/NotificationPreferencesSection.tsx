import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { ErrorState, LoadingState, OfflineState } from '@/components/feedback';
import { OFFLINE_STATE_TEST_ID, offlineCopy } from '@/components/feedback/offlineCopy';
import { DateTimeField } from '@/components/patterns';
import { AppButton, AppCard, AppText } from '@/components/primitives';
import { isNetworkError } from '@/core/network';
import { colors, spacing } from '@/theme';

import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import { useNotificationPreferencesForm } from '../hooks/useNotificationPreferencesForm';
import { useUpdateNotificationPreferences } from '../hooks/useUpdateNotificationPreferences';
import type { NotificationPreferences, UpdateNotificationPreferencesRequest } from '../types';
import { toNotificationErrorMessage } from '../utils/notificationErrorMessages';
import {
  UPCOMING_WINDOW_MAX,
  UPCOMING_WINDOW_MIN,
  type NotificationPreferencesDraft,
} from '../utils/preferenceValidation';

const WINDOW_STEP = 15;

function toDraft(preferences: NotificationPreferences): NotificationPreferencesDraft {
  return {
    overdueEnabled: preferences.overdueEnabled,
    upcomingEnabled: preferences.upcomingEnabled,
    upcomingWindowMinutes: preferences.upcomingWindowMinutes,
    quietHoursEnabled: preferences.quietStart !== null && preferences.quietEnd !== null,
    quietStart: preferences.quietStart ?? '22:00',
    quietEnd: preferences.quietEnd ?? '07:00',
    timezone: preferences.timezone,
  };
}

export function NotificationPreferencesSection() {
  const preferencesQuery = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();
  const preferences = preferencesQuery.data;

  // Only the absence of data decides the state: a background refetch that fails
  // must not replace the already loaded form. Checking `data === undefined`
  // after an error is what previously made the error branch unreachable.
  if (preferences === undefined) {
    if (preferencesQuery.isError) {
      return (
        <View style={styles.section} testID="notifications-preferences">
          {isNetworkError(preferencesQuery.error) ? (
            <OfflineState
              actionLabel={offlineCopy.actionLabel}
              message={offlineCopy.message}
              onAction={() => void preferencesQuery.refetch()}
              testID={OFFLINE_STATE_TEST_ID}
              title={offlineCopy.title}
            />
          ) : (
            <ErrorState
              actionLabel="Reintentar"
              message={toNotificationErrorMessage(preferencesQuery.error)}
              onAction={() => void preferencesQuery.refetch()}
              title="No se pudieron cargar"
            />
          )}
        </View>
      );
    }
    return (
      <View style={styles.section} testID="notifications-preferences">
        <LoadingState label="Cargando preferencias" />
      </View>
    );
  }

  return (
    <NotificationPreferencesForm
      initialDraft={toDraft(preferences)}
      // Remounts only when the persisted values change (e.g. after saving),
      // so in-progress edits survive refetches that return the same values.
      key={JSON.stringify(preferences)}
      isSaving={updatePreferences.isPending}
      onSave={(values) => updatePreferences.mutate(values)}
      saveError={updatePreferences.isError ? updatePreferences.error : null}
      saveSuccess={updatePreferences.isSuccess}
    />
  );
}

interface NotificationPreferencesFormProps {
  initialDraft: NotificationPreferencesDraft;
  isSaving: boolean;
  onSave(values: UpdateNotificationPreferencesRequest): void;
  saveError: unknown;
  saveSuccess: boolean;
}

function NotificationPreferencesForm({
  initialDraft,
  isSaving,
  onSave,
  saveError,
  saveSuccess,
}: NotificationPreferencesFormProps) {
  const [draft, setDraft] = useState<NotificationPreferencesDraft>(initialDraft);
  const { fieldErrors, payload, validationMessage } = useNotificationPreferencesForm(draft);

  function patch(next: Partial<NotificationPreferencesDraft>): void {
    setDraft((previous) => ({ ...previous, ...next }));
  }

  function adjustWindow(delta: number): void {
    const next = Math.min(
      UPCOMING_WINDOW_MAX,
      Math.max(UPCOMING_WINDOW_MIN, draft.upcomingWindowMinutes + delta)
    );
    patch({ upcomingWindowMinutes: next });
  }

  return (
    <View style={styles.section} testID="notifications-preferences">
      <AppText color="textSecondary">
        Elegí qué avisos recibir y en qué franja horaria no querés que te interrumpamos.
      </AppText>

      <AppCard variant="outlined">
        <View style={styles.rows}>
          <PreferenceSwitchRow
            description="Cuando una tarea ya pasó su fecha de vencimiento."
            label="Tareas vencidas"
            onChange={(value) => patch({ overdueEnabled: value })}
            testID="preferences-overdue"
            value={draft.overdueEnabled}
          />
          <PreferenceSwitchRow
            description="Antes de que una tarea llegue a su fecha de vencimiento."
            label="Tareas próximas a vencer"
            onChange={(value) => patch({ upcomingEnabled: value })}
            testID="preferences-upcoming"
            value={draft.upcomingEnabled}
          />
        </View>
      </AppCard>

      <AppCard variant="outlined">
        <View style={styles.windowRow}>
          <View style={styles.windowLabel}>
            <AppText variant="bodyStrong">Antelación del aviso</AppText>
            <AppText color="textSecondary" variant="caption">
              {draft.upcomingWindowMinutes} minutos antes
            </AppText>
          </View>
          <View style={styles.stepper}>
            <AppButton
              accessibilityLabel="Reducir la antelación"
              disabled={draft.upcomingWindowMinutes <= UPCOMING_WINDOW_MIN}
              label="−"
              onPress={() => adjustWindow(-WINDOW_STEP)}
              testID="preferences-window-decrease"
              variant="secondary"
            />
            <AppButton
              accessibilityLabel="Aumentar la antelación"
              disabled={draft.upcomingWindowMinutes >= UPCOMING_WINDOW_MAX}
              label="+"
              onPress={() => adjustWindow(WINDOW_STEP)}
              testID="preferences-window-increase"
              variant="secondary"
            />
          </View>
        </View>
        <AppText color="textSecondary" variant="caption" testID="preferences-window">
          Entre {UPCOMING_WINDOW_MIN} y {UPCOMING_WINDOW_MAX} minutos.
        </AppText>
        {fieldErrors.upcomingWindowMinutes ? (
          <AppText color="danger" variant="caption">
            {fieldErrors.upcomingWindowMinutes}
          </AppText>
        ) : null}
      </AppCard>

      <AppCard variant="outlined">
        <PreferenceSwitchRow
          description="No enviar notificaciones durante estas horas."
          label="Horas silenciosas"
          onChange={(value) => patch({ quietHoursEnabled: value })}
          testID="preferences-quiet"
          value={draft.quietHoursEnabled}
        />
        {draft.quietHoursEnabled ? (
          <View style={styles.quietFields}>
            <View style={styles.quietField}>
              <DateTimeField
                accessibilityLabel="Hora de inicio"
                mode="time"
                onChange={(value) => patch({ quietStart: value })}
                value={draft.quietStart}
              />
              {fieldErrors.quietStart ? (
                <AppText color="danger" variant="caption">
                  {fieldErrors.quietStart}
                </AppText>
              ) : null}
            </View>
            <View style={styles.quietField}>
              <DateTimeField
                accessibilityLabel="Hora de fin"
                mode="time"
                onChange={(value) => patch({ quietEnd: value })}
                value={draft.quietEnd}
              />
              {fieldErrors.quietEnd ? (
                <AppText color="danger" variant="caption">
                  {fieldErrors.quietEnd}
                </AppText>
              ) : null}
            </View>
          </View>
        ) : null}
      </AppCard>

      {validationMessage ? (
        <AppText color="danger" variant="caption">
          {validationMessage}
        </AppText>
      ) : null}
      {saveError ? (
        <AppText color="danger" variant="caption">
          {toNotificationErrorMessage(saveError)}
        </AppText>
      ) : null}
      {saveSuccess && validationMessage === null ? (
        <AppText color="positive" variant="caption" testID="preferences-saved">
          Preferencias guardadas.
        </AppText>
      ) : null}

      <AppButton
        accessibilityLabel="Guardar preferencias de notificaciones"
        disabled={validationMessage !== null}
        label="Guardar preferencias"
        loading={isSaving}
        onPress={() => onSave(payload)}
        testID="preferences-save"
      />
    </View>
  );
}

interface PreferenceSwitchRowProps {
  description: string;
  label: string;
  onChange(value: boolean): void;
  testID: string;
  value: boolean;
}

function PreferenceSwitchRow({
  description,
  label,
  onChange,
  testID,
  value,
}: PreferenceSwitchRowProps) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchLabel}>
        <AppText variant="bodyStrong">{label}</AppText>
        <AppText color="textSecondary" variant="caption">
          {description}
        </AppText>
      </View>
      <Switch
        accessibilityLabel={label}
        onValueChange={onChange}
        testID={testID}
        thumbColor={colors.textPrimary}
        trackColor={{ false: colors.border, true: colors.positive }}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  quietField: { flex: 1, gap: spacing.xxs, minWidth: 140 },
  quietFields: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md },
  rows: { gap: spacing.lg },
  section: { gap: spacing.md },
  stepper: { flexDirection: 'row', gap: spacing.sm },
  switchLabel: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  switchRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  windowLabel: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  windowRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
});
