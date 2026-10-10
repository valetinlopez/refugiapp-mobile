import { Pressable, StyleSheet, View } from 'react-native';

import type { AnimalOption } from '@/application/animals';
import type { HomePriority } from '@/application/home';
import { LoadingState } from '@/components/feedback';
import { AppCard, AppDivider, AppIcon, AppText } from '@/components/primitives';
import { opacity, sizes, spacing } from '@/theme';

import { HomePriorityRow } from './HomePriorityRow';

export interface TodayPrioritiesProps {
  animalsById: ReadonlyMap<string, AnimalOption>;
  isError: boolean;
  isPending: boolean;
  onOpenAgenda(): void;
  onOpenPriority(priority: HomePriority): void;
  onRetry(): void;
  priorities: readonly HomePriority[];
}

const ANIMAL_FALLBACK_NAME = 'Animal no disponible';

/**
 * "Prioridades de hoy" for Inicio (D36 / RFG-169).
 *
 * Renders a compact, best-effort view of the loaded pending page with derived
 * `Vencida`/`Próxima`/`Pendiente` states, a link to the full agenda and per-row
 * navigation to the task. It is explicitly scoped to the loaded page, so it
 * never promises the global next-due task. Animal names and photos resolve
 * through the shared `animal-options` cache; missing matches fall back to a
 * readable label, never a raw UUID.
 */
export function TodayPriorities({
  animalsById,
  isError,
  isPending,
  onOpenAgenda,
  onOpenPriority,
  onRetry,
  priorities,
}: TodayPrioritiesProps) {
  return (
    <View style={styles.section} testID="home-priorities">
      <View style={styles.header}>
        <AppText accessibilityRole="header" variant="heading2">
          Prioridades de hoy
        </AppText>
        <Pressable
          accessibilityLabel="Ver todos los cuidados"
          accessibilityRole="button"
          hitSlop={sizes.hitSlop}
          onPress={onOpenAgenda}
          style={({ pressed }) => [styles.agendaAction, pressed && styles.pressed]}
        >
          <AppText color="positive" variant="label">
            Ver agenda
          </AppText>
          <AppIcon color="positive" name="chevronRight" size={16} />
        </Pressable>
      </View>

      {isPending ? (
        <LoadingState label="Cargando prioridades" />
      ) : isError ? (
        <AppCard style={styles.stateCard} variant="outlined">
          <AppText>No pudimos cargar las prioridades.</AppText>
          <Pressable
            accessibilityLabel="Reintentar cargar prioridades"
            accessibilityRole="button"
            hitSlop={sizes.hitSlop}
            onPress={onRetry}
            style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
          >
            <AppText color="positive" variant="label">
              Reintentar
            </AppText>
          </Pressable>
        </AppCard>
      ) : priorities.length === 0 ? (
        <AppCard variant="outlined">
          <AppText color="textSecondary">No hay cuidados pendientes para hoy.</AppText>
        </AppCard>
      ) : (
        <AppCard testID="home-priorities-list">
          {priorities.map((priority, index) => {
            const animal = animalsById.get(priority.animalId);
            return (
              <View key={priority.id}>
                {index > 0 ? <AppDivider /> : null}
                <HomePriorityRow
                  animalName={animal?.name ?? ANIMAL_FALLBACK_NAME}
                  animalPhotoMediaId={animal?.profilePhotoMediaId ?? null}
                  onPress={onOpenPriority}
                  priority={priority}
                />
              </View>
            );
          })}
        </AppCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  agendaAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
    minHeight: 44,
    minWidth: 44,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: opacity.pressed,
  },
  retry: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  section: {
    gap: spacing.sm,
  },
  stateCard: {
    gap: spacing.sm,
  },
});
