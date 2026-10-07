import { StyleSheet, View } from 'react-native';

import { SectionHeader } from '@/components/patterns';
import { AppText } from '@/components/primitives';
import { spacing } from '@/theme';

import { ReferencePreview } from '../referencePreviews';
import { REFERENCE_CASES, REFERENCE_GROUPS, referenceCasesByGroup } from '../referenceCases';
import { REFERENCE_VIEWPORTS } from '../viewports';
import { ReferenceCaseCard } from './ReferenceCaseCard';

/**
 * Visual-validation harness section for the internal catalog (D06 / RFG-139).
 *
 * Renders every reference as a reproducible case grouped by domain, each with
 * its route, audience, states, divergences, the six-viewport checklist and a
 * preview composed from shared patterns and deterministic fixtures. No network,
 * personal data or external services are involved.
 */
export function ReferenceValidationSection() {
  return (
    <View style={styles.container} testID="ds-reference-validation">
      <AppText color="textSecondary">
        {`${REFERENCE_CASES.length} casos reproducibles con fixtures deterministas. Cada caso se valida en ${REFERENCE_VIEWPORTS.length} viewports: ${REFERENCE_VIEWPORTS.map((viewport) => viewport.label).join(', ')}.`}
      </AppText>
      {REFERENCE_GROUPS.map((group) => {
        const cases = referenceCasesByGroup(group.id);
        return (
          <View key={group.id} style={styles.group}>
            <SectionHeader subtitle={group.subtitle} title={group.title} />
            {cases.map((referenceCase) => (
              <ReferenceCaseCard key={referenceCase.id} referenceCase={referenceCase}>
                <ReferencePreview referenceCase={referenceCase} />
              </ReferenceCaseCard>
            ))}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  group: {
    gap: spacing.md,
  },
});
