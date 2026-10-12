import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimalsScreen } from '@/features/animals/components/AnimalsScreen';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { colors } from '@/theme';

export default function AnimalsScreenRoute() {
  const { canEditAnimal: canWrite } = useCapabilities();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <AnimalsScreen canWrite={canWrite} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
