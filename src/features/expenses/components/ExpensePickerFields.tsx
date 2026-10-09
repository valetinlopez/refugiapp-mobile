import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BottomSheet } from '@/components/feedback';
import { AppIcon, AppText } from '@/components/primitives';
import { colors, fontFamilies, opacity, radii, sizes, spacing } from '@/theme';

import type { AnimalOption, ExpenseCategory } from '../types';
import { getExpenseCategoryLabel } from '../utils/expensePresentation';
import { expenseCategories } from '../utils/expenseSchema';
import { ExpenseAnimalAvatar } from './ExpenseAnimalAvatar';
import { SheetOption } from './ExpenseFilterSheets';

export function ExpenseAnimalField({
  animals,
  disabled,
  onChange,
  value,
}: {
  animals: readonly AnimalOption[];
  disabled: boolean;
  onChange(value: string): void;
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = animals.find((animal) => animal.id === value);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es');
    if (normalizedQuery === '') return animals;
    return animals.filter((animal) =>
      animal.name.toLocaleLowerCase('es').includes(normalizedQuery)
    );
  }, [animals, query]);

  const selectedMeta = selected
    ? [selected.species, selected.breed].filter((part): part is string => Boolean(part)).join(' · ')
    : undefined;

  return (
    <>
      <Pressable
        accessibilityLabel={selected ? 'Animal: ' + selected.name : 'Seleccionar animal'}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        hitSlop={sizes.hitSlop}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.selector, pressed && styles.pressed]}
      >
        {selected ? (
          <ExpenseAnimalAvatar
            name={selected.name}
            profilePhotoMediaId={selected.profilePhotoMediaId}
            size="md"
          />
        ) : (
          <View style={styles.selectorIcon}>
            <AppIcon color="positive" name="paw" />
          </View>
        )}
        <View style={styles.selectorCopy}>
          <AppText color={selected ? 'textPrimary' : 'textSecondary'}>
            {selected?.name ?? 'Elegí un animal'}
          </AppText>
          <AppText color="textSecondary" numberOfLines={1} variant="caption">
            {selectedMeta ?? 'Tocá para ver los animales disponibles'}
          </AppText>
        </View>
        <AppIcon color="textSecondary" name="chevronRight" />
      </Pressable>

      <BottomSheet
        closeAccessibilityLabel="Cerrar selección de animal"
        onClose={() => {
          setOpen(false);
          setQuery('');
        }}
        testID="expense-animal-field-sheet"
        title="Seleccionar animal"
        visible={open}
      >
        <TextInput
          accessibilityLabel="Buscar animal por nombre"
          autoCapitalize="words"
          autoCorrect={false}
          editable={!disabled}
          onChangeText={setQuery}
          placeholder="Buscar animal"
          placeholderTextColor={colors.textSecondary}
          returnKeyType="done"
          style={styles.search}
          value={query}
        />
        <View
          accessibilityLabel="Animales disponibles"
          accessibilityRole="radiogroup"
          style={styles.options}
        >
          {filtered.map((animal) => {
            const checked = animal.id === value;
            return (
              <Pressable
                accessibilityLabel={animal.name}
                accessibilityRole="radio"
                accessibilityState={{ checked, disabled }}
                disabled={disabled}
                hitSlop={sizes.hitSlop}
                key={animal.id}
                onPress={() => {
                  onChange(animal.id);
                  setOpen(false);
                  setQuery('');
                }}
                style={({ pressed }) => [
                  styles.option,
                  checked && styles.optionSelected,
                  pressed && styles.pressed,
                ]}
              >
                <ExpenseAnimalAvatar
                  name={animal.name}
                  profilePhotoMediaId={animal.profilePhotoMediaId}
                  size="sm"
                />
                <AppText style={styles.optionName} numberOfLines={2} variant="label">
                  {animal.name}
                </AppText>
                {checked ? <AppIcon color="positive" name="check" /> : null}
              </Pressable>
            );
          })}
          {filtered.length === 0 ? (
            <AppText color="textSecondary">
              No hay animales que coincidan con &quot;{query.trim()}&quot;.
            </AppText>
          ) : null}
        </View>
      </BottomSheet>
    </>
  );
}

export function ExpenseCategoryField({
  disabled,
  onChange,
  value,
}: {
  disabled: boolean;
  onChange(value: ExpenseCategory): void;
  value: ExpenseCategory;
}) {
  const [open, setOpen] = useState(false);
  const label = getExpenseCategoryLabel(value);

  return (
    <>
      <Pressable
        accessibilityLabel={'Categoría: ' + label}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        hitSlop={sizes.hitSlop}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.selector, pressed && styles.pressed]}
      >
        <View style={styles.selectorIcon}>
          <AppIcon color="positive" name="money" />
        </View>
        <View style={styles.selectorCopy}>
          <AppText>{label}</AppText>
          <AppText color="textSecondary" variant="caption">
            Tocá para cambiar la categoría
          </AppText>
        </View>
        <AppIcon color="textSecondary" name="chevronRight" />
      </Pressable>

      <BottomSheet
        closeAccessibilityLabel="Cerrar selección de categoría"
        onClose={() => setOpen(false)}
        testID="expense-category-field-sheet"
        title="Seleccionar categoría"
        visible={open}
      >
        <View accessibilityLabel="Categorías" accessibilityRole="radiogroup" style={styles.options}>
          {expenseCategories.map((category) => (
            <SheetOption
              key={category}
              label={getExpenseCategoryLabel(category)}
              onPress={() => {
                onChange(category);
                setOpen(false);
              }}
              selected={category === value}
              testID={`expense-category-option-${category}`}
            />
          ))}
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  option: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: sizes.touchTarget,
    padding: spacing.sm,
  },
  optionName: { flex: 1 },
  optionSelected: { borderColor: colors.positive, borderWidth: 2 },
  options: { gap: spacing.xs },
  pressed: { opacity: opacity.pressedSubtle },
  search: {
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
  selector: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: sizes.buttonHeight,
    padding: spacing.sm,
  },
  selectorCopy: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  selectorIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.full,
    height: sizes.avatarMd,
    justifyContent: 'center',
    width: sizes.avatarMd,
  },
});
