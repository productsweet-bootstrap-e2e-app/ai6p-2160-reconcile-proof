/**
 * The preview manifest — the extensible list of specimens the `/__preview`
 * harness renders. Later preview stages (screen-level previews, design
 * directions) grow THIS list; the harness entry (`preview.tsx`) renders
 * whatever the manifest declares, so adding a specimen is a one-line edit here.
 */
import type { ComponentType } from 'react';
import {
  ButtonsSpecimen,
  CardSpecimen,
  ColourSwatchesSpecimen,
  FormInputsSpecimen,
  TypographySpecimen,
} from './specimens';

export interface PreviewSpecimen {
  /** Stable id (used as the React key + anchor). */
  readonly id: string;
  /** Human-readable section title. */
  readonly title: string;
  /** The token-driven component to render. */
  readonly Component: ComponentType;
}

export const previewManifest: ReadonlyArray<PreviewSpecimen> = [
  { id: 'typography', title: 'Typography', Component: TypographySpecimen },
  { id: 'buttons', title: 'Buttons', Component: ButtonsSpecimen },
  { id: 'card', title: 'Card', Component: CardSpecimen },
  { id: 'form-inputs', title: 'Form inputs', Component: FormInputsSpecimen },
  { id: 'colour-swatches', title: 'Colour swatches', Component: ColourSwatchesSpecimen },
];
