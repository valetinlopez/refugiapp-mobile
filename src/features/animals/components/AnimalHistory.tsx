import { StyleSheet, View } from 'react-native';

import { AppCard, AppText } from '@/components/primitives';
import { EmptyState, ErrorState, LoadingState, OfflineState } from '@/components/feedback';
import { OFFLINE_STATE_TEST_ID, offlineCopy } from '@/components/feedback/offlineCopy';
import { isNetworkError } from '@/core/network';
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
    if (isNetworkError(eventsQuery.error)) {
      return (
        <OfflineState
          actionLabel={offlineCopy.actionLabel}
          message={offlineCopy.message}
          onAction={() => void eventsQuery.refetch()}
          testID={OFFLINE_STATE_TEST_ID}
          title={offlineCopy.title}
        />
      );
    }
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
          accessibilityLabel={`${getAnimalEventTypeLabel(event.eventType)}, ${event.description}, ${formatAnimalEventDate(event.occurredAt)}`}
          key={event.id}
        >
          <View style={styles.row}>
            <AppText
              color="textSecondary"
              numberOfLines={1}
              style={styles.rowLabel}
              variant="label"
            >
              {getAnimalEventTypeLabel(event.eventType)}
            </AppText>
            <AppText
              color="textSecondary"
              numberOfLines={1}
              style={styles.rowMeta}
              variant="caption"
            >
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
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  rowLabel: {
    flexShrink: 0,
    maxWidth: '100%',
  },
  rowMeta: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
  },
});
