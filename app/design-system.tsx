import { useMemo, useState, type PropsWithChildren } from 'react';
import Head from 'expo-router/head';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, LoadingState, OfflineState } from '@/components/feedback';
import {
  AppHeaderBack,
  BottomNavigation,
  type BottomNavigationItem,
} from '@/components/navigation';
import {
  AttachmentList,
  DecorativeBackground,
  EntityCard,
  MetadataRow,
  ScreenHeader,
  SectionHeader,
  SegmentedControl,
  TaskRow,
  formatDateMedium,
  type AttachmentItem,
  type SegmentedControlOption,
} from '@/components/patterns';
import {
  AppAvatar,
  AppBadge,
  AppButton,
  AppCard,
  AppDivider,
  AppIcon,
  AppText,
  FAB,
} from '@/components/primitives';
import { colors, radii, sizes, spacing, typography } from '@/theme';

type CatalogSegment = 'all' | 'completed' | 'pending';

const segmentOptions: readonly SegmentedControlOption<CatalogSegment>[] = [
  { id: 'all', label: 'Todas' },
  { icon: 'clock', id: 'pending', label: 'Pendientes' },
  { icon: 'check', id: 'completed', label: 'Completadas' },
];

const sampleAttachments: readonly AttachmentItem[] = [
  { id: 'ready', name: 'radiografia-torax.jpg', sizeLabel: '1,2 MB', status: 'ready' },
  {
    id: 'uploading',
    name: 'informe-laboratorio.pdf',
    progress: 0.45,
    sizeLabel: '840 KB',
    status: 'uploading',
  },
  {
    errorMessage: 'No pudimos subir el archivo.',
    id: 'error',
    name: 'receta-digital.pdf',
    status: 'error',
  },
];

const navigationItems: readonly BottomNavigationItem[] = [
  { icon: 'home', id: 'home', label: 'Inicio' },
  { icon: 'paw', id: 'animals', label: 'Animales' },
  { icon: 'calendar', id: 'care', label: 'Cuidados' },
  { icon: 'menu', id: 'more', label: 'Más' },
];

const colorEntries = [
  ['background', colors.background],
  ['surface', colors.surface],
  ['surfaceElevated', colors.surfaceElevated],
  ['textPrimary', colors.textPrimary],
  ['textSecondary', colors.textSecondary],
  ['positive', colors.positive],
  ['warning', colors.warning],
  ['danger', colors.danger],
  ['info', colors.info],
  ['neutral', colors.neutral],
] as const;

const spacingEntries = Object.entries(spacing).filter(([name]) => name !== 'none');

function Section({ children, title }: PropsWithChildren<{ title: string }>) {
  return (
    <View style={styles.section}>
      <SectionHeader title={title} />
      {children}
    </View>
  );
}

export default function DesignSystemScreen() {
  const [activeNavigationItem, setActiveNavigationItem] = useState('home');
  const [activeSegment, setActiveSegment] = useState<CatalogSegment>('all');
  const [attachments, setAttachments] = useState<readonly AttachmentItem[]>(sampleAttachments);
  const now = useMemo(() => new Date('2026-09-20T12:00:00-03:00'), []);

  return (
    <SafeAreaView edges={['top', 'right', 'left']} style={styles.safeArea}>
      <Head>
        <title>Refugiapp — Sistema de diseño</title>
        <meta
          content="Catálogo interno de la identidad visual y los componentes compartidos de Refugiapp Mobile."
          name="description"
        />
      </Head>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <AppIcon color="positive" name="paw" size={sizes.iconLg} />
          </View>
          <View style={styles.heroCopy}>
            <AppText variant="display">Sistema de diseño</AppText>
            <AppText color="textSecondary">
              Catálogo interno de la identidad orgánica, protectora y profesional de Refugiapp.
            </AppText>
          </View>
        </View>

        <Section title="Color">
          <View style={styles.grid}>
            {colorEntries.map(([name, value]) => (
              <AppCard key={name} style={styles.colorTile} variant="outlined">
                <View style={[styles.swatch, { backgroundColor: value }]} />
                <AppText variant="label">{name}</AppText>
                <AppText color="textSecondary" variant="caption">
                  {value}
                </AppText>
              </AppCard>
            ))}
          </View>
        </Section>

        <Section title="Tipografía">
          <AppCard style={styles.stack}>
            {(Object.keys(typography) as (keyof typeof typography)[]).map((variant) => (
              <View key={variant} style={styles.typeRow}>
                <AppText color="textSecondary" variant="caption">
                  {variant}
                </AppText>
                <AppText variant={variant}>Cuidar también es observar</AppText>
              </View>
            ))}
          </AppCard>
        </Section>

        <Section title="Espaciado">
          <AppCard style={styles.stack} variant="outlined">
            {spacingEntries.map(([name, value]) => (
              <View key={name} style={styles.spacingRow}>
                <AppText style={styles.spacingLabel} variant="caption">
                  {name}
                </AppText>
                <View style={[styles.spacingBar, { width: value }]} />
                <AppText color="textSecondary" variant="caption">{`${value} pt`}</AppText>
              </View>
            ))}
          </AppCard>
        </Section>

        <Section title="Botones">
          <View style={styles.buttonStack}>
            <AppButton icon="heart" label="Acción principal" />
            <AppButton label="Acción secundaria" variant="secondary" />
            <AppButton icon="alert" label="Acción destructiva" variant="danger" />
            <AppButton label="Acción discreta" variant="ghost" />
            <AppButton label="Cargando" loading />
            <AppButton disabled label="No disponible" />
          </View>
        </Section>

        <Section title="Tarjetas y métricas">
          <View style={styles.metricGrid}>
            <AppCard style={styles.metricCard} variant="organic">
              <AppIcon color="positive" name="paw" />
              <AppText variant="heading1">5</AppText>
              <AppText color="textSecondary" variant="label">
                Ingresos
              </AppText>
            </AppCard>
            <AppCard style={styles.metricCard} variant="elevated">
              <AppIcon color="info" name="medical" />
              <AppText variant="heading1">12</AppText>
              <AppText color="textSecondary" variant="label">
                En tratamiento
              </AppText>
            </AppCard>
          </View>
        </Section>

        <Section title="Badges de estado">
          <AppText color="textSecondary" variant="label">
            Animal
          </AppText>
          <View style={styles.badgeWrap}>
            <AppBadge icon="paw" label="Ingresado" />
            <AppBadge icon="medical" label="En tratamiento" tone="info" />
            <AppBadge icon="heart" label="Disponible para adopción" tone="positive" />
            <AppBadge icon="check" label="Adoptado" tone="positive" />
            <AppBadge icon="info" label="Fallecido" tone="neutral" />
          </View>
          <AppText color="textSecondary" variant="label">
            Tareas y derivados
          </AppText>
          <View style={styles.badgeWrap}>
            <AppBadge icon="clock" label="Pendiente" />
            <AppBadge icon="check" label="Completada" tone="positive" />
            <AppBadge icon="close" label="Cancelada" tone="neutral" />
            <AppBadge icon="alert" label="Vencida" tone="danger" />
            <AppBadge icon="clock" label="Próxima" tone="warning" />
            <AppBadge icon="medical" label="Clínica" tone="info" />
          </View>
        </Section>

        <Section title="Avatares">
          <View style={styles.avatarRow}>
            <AppAvatar accessibilityLabel="Avatar pequeño de Luna" initials="LU" size="sm" />
            <AppAvatar accessibilityLabel="Avatar mediano de Toby" initials="TO" size="md" />
            <AppAvatar accessibilityLabel="Avatar grande de Milo" initials="MI" size="lg" />
          </View>
        </Section>

        <Section title="Filas de tareas">
          <AppCard>
            <TaskRow
              animalName="Luna"
              assignee="Dra. Sofía"
              now={now}
              status="completed"
              timeLabel="09:30"
              title="Control veterinario"
            />
            <AppDivider />
            <TaskRow
              animalName="Toby"
              dueAt={new Date('2026-09-20T17:00:00-03:00')}
              now={now}
              status="pending"
              timeLabel="17:00"
              title="Medicación"
            />
            <AppDivider />
            <TaskRow
              animalName="Milo"
              dueAt={new Date('2026-09-20T10:00:00-03:00')}
              isClinical
              now={now}
              status="pending"
              timeLabel="10:00"
              title="Vacunación"
            />
            <AppDivider />
            <TaskRow
              animalName="Nala"
              isClinical
              now={now}
              status="pending"
              timeLabel="Mañana"
              title="Revisión general"
            />
          </AppCard>
        </Section>

        <Section title="Estados de feedback">
          <View style={styles.stack}>
            <LoadingState label="Cargando animales" />
            <EmptyState
              message="Los nuevos ingresos aparecerán aquí."
              title="Todavía no hay animales"
            />
            <ErrorState
              actionLabel="Reintentar"
              message="No pudimos cargar la información."
              onAction={() => undefined}
              title="Algo salió mal"
            />
            <OfflineState
              actionLabel="Volver a intentar"
              message="Revisá tu conexión para sincronizar los cambios."
              onAction={() => undefined}
              title="Sin conexión"
            />
          </View>
        </Section>

        <Section title="Navegación inferior">
          <BottomNavigation
            activeId={activeNavigationItem}
            items={navigationItems}
            onSelect={setActiveNavigationItem}
          />
        </Section>

        <Section title="Encabezado de retorno">
          <AppText color="textSecondary" variant="caption">
            Vuelve con <AppText variant="label">canGoBack</AppText> o reemplaza con el fallback
            contextual en deep links sin historial.
          </AppText>
          <View style={styles.stack}>
            <AppHeaderBack
              accessibilityHint="Volver a la lista de animales"
              fallbackHref="/explore"
            />
            <AppHeaderBack
              accessibilityHint="Volver al detalle del animal"
              fallbackHref={{
                pathname: '/animals/[id]',
                params: { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
              }}
            />
          </View>
        </Section>

        <Section title="Fondo decorativo">
          <AppText color="textSecondary" variant="caption">
            Capa absoluta sobre la que se compone el contenido. Oculta a tecnologías asistivas y sin
            texto incrustado.
          </AppText>
          <View style={styles.backgroundGrid}>
            <View style={styles.backgroundPreview}>
              <DecorativeBackground testID="ds-background-hero" variant="hero" />
            </View>
            <View style={styles.backgroundPreview}>
              <DecorativeBackground variant="texture" />
            </View>
          </View>
        </Section>

        <Section title="Encabezado de pantalla">
          <ScreenHeader
            actions={<AppButton icon="add" label="Nueva tarea" />}
            subtitle="Resumen operativo del refugio"
            title="Cuidados"
          />
        </Section>

        <Section title="Encabezado de sección">
          <SectionHeader
            action={
              <AppText color="positive" variant="label">
                Ver todo
              </AppText>
            }
            subtitle="Eventos recientes del animal"
            title="Historial"
          />
        </Section>

        <Section title="Control segmentado">
          <SegmentedControl
            accessibilityLabel="Filtrar tareas por estado"
            onChange={(value) => setActiveSegment(value)}
            options={segmentOptions}
            value={activeSegment}
          />
        </Section>

        <Section title="Acción flotante">
          <View style={styles.fabPreview}>
            <AppText color="textSecondary" variant="caption">
              Respeta el inset inferior y expone label accesible obligatorio.
            </AppText>
            <FAB
              accessibilityLabel="Nueva tarea"
              bottomOffset={spacing.md}
              onPress={() => undefined}
            />
          </View>
        </Section>

        <Section title="Tarjeta de entidad">
          <View style={styles.stack}>
            <EntityCard
              avatar={{ accessibilityLabel: 'Foto de Luna', initials: 'LU' }}
              badge={{ icon: 'medical', label: 'En tratamiento', tone: 'info' }}
              meta="Perra · Mestiza"
              onPress={() => undefined}
              title="Luna"
            />
            <EntityCard
              badge={{ icon: 'clock', label: 'Pendiente' }}
              meta="Vence mañana 09:30"
              title="Control veterinario"
            />
          </View>
        </Section>

        <Section title="Metadatos">
          <AppCard style={styles.stack}>
            <MetadataRow label="Ingreso" value={formatDateMedium('2026-09-20')} />
            <AppDivider />
            <MetadataRow label="Especie" value="Perro" />
            <AppDivider />
            <MetadataRow label="Estado" value="En tratamiento" />
          </AppCard>
        </Section>

        <Section title="Adjuntos">
          <AttachmentList
            attachments={attachments}
            onRemove={(id) =>
              setAttachments((current) => current.filter((attachment) => attachment.id !== id))
            }
            onRetry={() => undefined}
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatarRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  backgroundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  backgroundPreview: {
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexBasis: '45%',
    flexGrow: 1,
    height: 180,
    minWidth: 160,
    overflow: 'hidden',
    position: 'relative',
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  fabPreview: {
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    height: 160,
    padding: spacing.md,
    position: 'relative',
  },
  buttonStack: {
    gap: spacing.sm,
  },
  colorTile: {
    flexBasis: '42%',
    flexGrow: 1,
    minWidth: 140,
  },
  content: {
    alignSelf: 'center',
    gap: spacing['2xl'],
    maxWidth: sizes.contentMaxWidth,
    paddingBottom: spacing['3xl'],
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  hero: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  heroCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    height: sizes.touchTarget,
    justifyContent: 'center',
    width: sizes.touchTarget,
  },
  metricCard: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 140,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  section: {
    gap: spacing.md,
  },
  spacingBar: {
    backgroundColor: colors.positive,
    borderRadius: radii.full,
    height: spacing.xs,
  },
  spacingLabel: {
    width: 52,
  },
  spacingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: sizes.touchTarget,
  },
  stack: {
    gap: spacing.md,
  },
  swatch: {
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 56,
    marginBottom: spacing.sm,
    width: '100%',
  },
  typeRow: {
    gap: spacing.xxs,
  },
});
