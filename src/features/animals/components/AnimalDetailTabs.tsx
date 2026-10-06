import { ScrollView, StyleSheet, View } from 'react-native';

import { FilterChip } from '@/components/patterns';
import { spacing } from '@/theme';

export type AnimalDetailTab =
  'summary' | 'history' | 'tasks' | 'expenses' | 'adoptions' | 'clinical';

const TABS: { id: AnimalDetailTab; label: string }[] = [
  { id: 'summary', label: 'Resumen' },
  { id: 'history', label: 'Historial' },
  { id: 'tasks', label: 'Tareas' },
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
    <ScrollView
      accessibilityLabel="Secciones del animal"
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      <View style={styles.tabs}>
        {TABS.filter((tab) => tab.id !== 'clinical' || canReadClinicalRecords).map((tab) => (
          <FilterChip
            key={tab.id}
            label={tab.label}
            onPress={() => onChange(tab.id)}
            selected={activeTab === tab.id}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ tabs: { flexDirection: 'row', gap: spacing.xs } });
