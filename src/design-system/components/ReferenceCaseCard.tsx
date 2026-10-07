import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { MetadataRow } from '@/components/patterns';
import { AppBadge, AppCard, AppText } from '@/components/primitives';
import { colors, radii, spacing } from '@/theme';
import type { BadgeTone } from '@/types/design-system';

import { REFERENCE_VIEWPORTS } from '../viewports';
import type { DivergenceKind, ReferenceCase, ReferenceStateId } from '../types';

const STATE_LABELS: Record<ReferenceStateId, string> = {
  default: 'Por defecto',
  loading: 'Carga',
  empty: 'Vacío',
  error: 'Error',
  offline: 'Sin conexión',
  restricted: 'Sin permisos',
};

const DIVERGENCE_PRESENTATION: Record<DivergenceKind, { label: string; tone: BadgeTone }> = {
  implemented: { label: 'Implementado', tone: 'positive' },
  contract: { label: 'Contrato', tone: 'neutral' },
  ux: { label: 'UX', tone: 'info' },
  pending: { label: 'Pendiente', tone: 'warning' },
};

export interface ReferenceCaseCardProps {
  referenceCase: ReferenceCase;
  /** The reproducible preview composed from shared patterns and fixtures. */
  children?: ReactNode;
}

/**
 * One reproducible visual-validation case (D06 / RFG-139).
 *
 * Surfaces the reference file, hosting route, visual audience, relevant states,
 * known divergences and the six required viewports, followed by a reproducible
 * preview built from shared patterns and deterministic fixtures. The card is a
 * single accessible summary so `RFG-167` can select it by `testID` and assistive
 * technologies can read the case without relying on color.
 */
export function ReferenceCaseCard({ referenceCase, children }: ReferenceCaseCardProps) {
  const label = [
    `Caso ${referenceCase.id}`,
    `referencia ${referenceCase.referenceFile}`,
    `ruta ${referenceCase.route}`,
    `roles: ${referenceCase.audience}`,
    `estados: ${referenceCase.states.map((state) => STATE_LABELS[state]).join(', ') || 'por defecto'}`,
  ].join('. ');

  return (
    <AppCard
      accessibilityLabel={label}
      accessibilityRole="summary"
      style={styles.card}
      testID={`ds-case-${referenceCase.id}`}
      variant="outlined"
    >
      <View style={styles.header}>
        <AppBadge icon="document" label={referenceCase.referenceFile} tone="info" />
        <AppBadge label={referenceCase.id} />
      </View>

      <MetadataRow label="Ruta" value={referenceCase.route} />
      <MetadataRow label="Rol / capacidad" value={referenceCase.audience} />

      <View style={styles.block}>
        <AppText color="textSecondary" variant="label">
          Estados relevantes
        </AppText>
        <View style={styles.wrap}>
          {referenceCase.states.map((state) => (
            <AppBadge key={state} label={STATE_LABELS[state]} />
          ))}
        </View>
      </View>

      <View style={styles.block}>
        <AppText color="textSecondary" variant="label">
          Divergencias
        </AppText>
        <View style={styles.stack}>
          {referenceCase.divergences.map((divergence) => {
            const presentation = DIVERGENCE_PRESENTATION[divergence.kind];
            return (
              <View key={`${divergence.kind}-${divergence.note}`} style={styles.divergence}>
                <AppBadge label={presentation.label} tone={presentation.tone} />
                <AppText style={styles.divergenceNote}>{divergence.note}</AppText>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.block}>
        <AppText color="textSecondary" variant="label">
          Checklist por viewport
        </AppText>
        <View style={styles.wrap}>
          {REFERENCE_VIEWPORTS.map((viewport) => (
            <AppBadge icon="check" key={viewport.id} label={viewport.label} />
          ))}
        </View>
      </View>

      <View style={styles.previewBlock}>
        <AppText color="textSecondary" variant="label">
          Caso reproducible
        </AppText>
        {children}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.xs,
  },
  card: {
    gap: spacing.md,
  },
  divergence: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  divergenceNote: {
    flex: 1,
    minWidth: 0,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  previewBlock: {
    borderColor: colors.divider,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.sm,
  },
  stack: {
    gap: spacing.sm,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
