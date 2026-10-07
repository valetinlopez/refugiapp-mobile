import { ScrollView, StyleSheet } from 'react-native';

import { AppCard } from '@/components/primitives';
import { FilterChip } from '@/components/patterns';
import { spacing } from '@/theme';

export type AnimalDetailTab =
  'summary' | 'history' | 'tasks' | 'expenses' | 'adoptions' | 'clinical';

const TABS: { id: AnimalDetailTab; label: string }[] = [
  { id: 'summary', label: 'Resumen' },
  { id: 'history', label: 'Historial' },
  { id: 'tasks', label: 'Cuidados' },
  { id: 'expenses', label: 'Gastos' },
  { id: 'adoptions', label: 'Adopción' },
  { id: 'clinical', label: 'Evolución clínica' },
];

export function AnimalDetailTabs({
  activeTab,
  canReadClinicalRecords,
  onChange,
}: {
  activeTab: AnimalDetailTab;
  canReadClinicalRecords: boolean;
  onChange(tab: AnimalDetailTab): void;
}) {
  return (
    <AppCard padded={false} style={styles.container} testID="animal-detail-tabs" variant="elevated">
      <ScrollView
        accessibilityLabel="Secciones del animal"
        accessibilityRole="tablist"
        contentContainerStyle={styles.tabs}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {TABS.filter((tab) => tab.id !== 'clinical' || canReadClinicalRecords).map((tab) => (
          <FilterChip
            appearance="plain"
            accessibilityHint={`Muestra la sección ${tab.label.toLowerCase()} del animal`}
            accessibilityRole="tab"
            key={tab.id}
            label={tab.label}
            onPress={() => onChange(tab.id)}
            selected={activeTab === tab.id}
          />
        ))}
      </ScrollView>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  tabs: {
    gap: spacing.xs,
    padding: spacing.sm,
  },
});
