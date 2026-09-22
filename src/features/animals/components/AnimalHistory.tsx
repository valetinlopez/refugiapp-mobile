import { StyleSheet, View } from 'react-native';

import { AppCard, AppText } from '@/components/primitives';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { spacing } from '@/theme';

import { useAnimalHistory } from '../hooks/useAnimalHistory';
import { formatAnimalEventDate, getAnimalEventTypeLabel } from '../utils/animalHistoryPresentation';

export interface AnimalHistoryProps {
  animalId: string;
}

export function AnimalHistory({ animalId }: AnimalHistoryProps) {
  const eventsQuery = useAnimalHistory(animalId);

  if (eventsQuery.isPending) {
    return <LoadingState label="Cargando historial" />;
  }

  if (eventsQuery.isError) {
    return (
      <ErrorState
        actionLabel="Reintentar"
        message="No pudimos cargar el historial del animal."
        onAction={() => void eventsQuery.refetch()}
        title="No se pudo cargar el historial"
      />
    );
  }

  if (eventsQuery.data === undefined || eventsQuery.data.items.length === 0) {
    return (
      <EmptyState
        message="Todavía no hay eventos registrados para este animal."
        title="Sin historial"
      />
    );
  }

  return (
    <View accessibilityLabel="Historial de eventos" style={styles.list}>
      {eventsQuery.data.items.map((event) => (
        <AppCard
          accessibilityLabel={`${getAnimalEventTypeLabel(event.eventType)}, ${event.description}`}
          key={event.id}
        >
          <View style={styles.row}>
            <AppText color="textSecondary" variant="label">
              {getAnimalEventTypeLabel(event.eventType)}
            </AppText>
            <AppText color="textSecondary" variant="caption">
              {formatAnimalEventDate(event.occurredAt)}
            </AppText>
          </View>
          <AppText>{event.description}</AppText>
        </AppCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
});
