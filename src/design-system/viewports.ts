/**
 * Viewport matrix for the visual-validation harness (D06 / RFG-139).
 *
 * Every reproducible case must be checked against this fixed matrix. The list
 * lives in code so the checklist document and the `/design-system` route render
 * the exact same set, and tests can assert the coverage required by the ticket.
 */
export interface ReferenceViewport {
  id: string;
  /** Human-readable label shown in the catalog and the checklist. */
  label: string;
  /** What must be verified on this viewport. */
  detail: string;
}

export const REFERENCE_VIEWPORTS = [
  {
    id: 'phone-small',
    label: '320 × 568',
    detail: 'Teléfono chico: sin recortes ni desbordes horizontales.',
  },
  {
    id: 'phone-standard',
    label: '390 × 844',
    detail: 'Teléfono estándar: ritmo vertical y targets de 44 × 44.',
  },
  {
    id: 'tablet',
    label: 'Tablet',
    detail: 'Ancho de lectura limitado a 760 pt y centrado.',
  },
  {
    id: 'landscape',
    label: 'Horizontal',
    detail: 'Solo cuando la pantalla lo admite; sin alturas rígidas.',
  },
  {
    id: 'font-200',
    label: 'Fuente 200 %',
    detail: 'El texto escala sin colisionar ni truncar datos críticos.',
  },
  {
    id: 'reduce-motion',
    label: 'Reduce motion',
    detail: 'Sin animación indispensable; toda transición tiene alternativa estática.',
  },
] as const satisfies readonly ReferenceViewport[];

export type ReferenceViewportId = (typeof REFERENCE_VIEWPORTS)[number]['id'];
