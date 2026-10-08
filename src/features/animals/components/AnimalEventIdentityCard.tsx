import { StyleSheet, View } from 'react-native';

import { AppAvatar, AppBadge, AppCard, AppText } from '@/components/primitives';
import { sizes, spacing } from '@/theme';

export interface AnimalEventIdentityCardProps {
  breed: string | null;
  name: string;
  photoUri: string | null;
  species: string;
}

/**
 * Cabecera de identidad del alta de evento (D15 / RFG-148). Reutiliza el
 * lenguaje visual de la cabecera del detalle del animal (`AppCard organic` +
 * `AppAvatar` protagonista), pero con un badge fijo de contexto ("Evento
 * general") en lugar del estado del animal. No conoce endpoints ni roles.
 */
export function AnimalEventIdentityCard({
  breed,
  name,
  photoUri,
  species,
}: AnimalEventIdentityCardProps) {
  const description = breed ? `${species} · ${breed}` : species;

  return (
    <AppCard
      accessibilityLabel={`${name}. ${description}. Evento general`}
      accessibilityRole="summary"
      style={styles.card}
      testID="create-event-identity"
      variant="organic"
    >
      <View style={styles.layout}>
        <AppAvatar
          accessibilityLabel={photoUri ? `Foto de ${name}` : `Sin foto de ${name}`}
          initials={name.slice(0, 2)}
          shape="rounded"
          size="xl"
          source={photoUri ? { uri: photoUri } : undefined}
        />
        <View style={styles.identity}>
          <AppText accessibilityRole="header" variant="display">
            {name}
          </AppText>
          <AppText color="textSecondary" variant="bodyStrong">
            {description}
          </AppText>
          <AppBadge icon="document" label="Evento general" tone="info" />
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  identity: {
    flex: 1,
    gap: spacing.xs,
    minWidth: sizes.avatarXl,
  },
  layout: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'center',
  },
});
