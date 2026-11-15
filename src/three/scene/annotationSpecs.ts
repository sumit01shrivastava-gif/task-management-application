export type LabelChannel = 'labelsPlatform' | 'labelsExploded' | 'labelsIroNav' | 'labelsInternals';

export interface AnnotationSpec {
  anchor: string;
  title: string;
  sub?: string;
  /** World-space offset of the label from its anchor. */
  offset: [number, number, number];
  channel: LabelChannel;
  align?: 'left' | 'right';
  /** Hidden on small screens to keep the view legible. */
  desktopOnly?: boolean;
}

/** Annotation sets shown during each stage. Copy is descriptive only. */
export const ANNOTATIONS: AnnotationSpec[] = [
  { anchor: 'ironav', title: 'IroNav module', sub: 'Mounted beneath the central assembly', offset: [0.95, -0.5, 0.5], channel: 'labelsPlatform' },
  { anchor: 'upperEquipment', title: 'Upper equipment assembly', offset: [-1.1, 0.45, 0.2], channel: 'labelsExploded', align: 'left', desktopOnly: true },
  { anchor: 'battery', title: 'Power enclosure', offset: [-1.35, 0.15, 0.4], channel: 'labelsExploded', align: 'left', desktopOnly: true },
  { anchor: 'cables', title: 'External cables & connectors', offset: [1.0, -0.2, 0.4], channel: 'labelsExploded', desktopOnly: true },
  { anchor: 'frame', title: 'Central carbon-fibre frame', offset: [-1.6, -0.35, 0.5], channel: 'labelsExploded', align: 'left', desktopOnly: true },
  { anchor: 'motor', title: 'Coaxial motor & propeller assemblies', offset: [0.8, 0.5, 0.2], channel: 'labelsExploded', desktopOnly: true },
  { anchor: 'ironav', title: 'IroNav module', offset: [1.05, -0.15, 0.3], channel: 'labelsExploded' },
  { anchor: 'ironav.bracket', title: 'Mounting plate', sub: 'Exterior view', offset: [-0.85, 0.3, 0.1], channel: 'labelsIroNav', align: 'left' },
  { anchor: 'ironav.ports', title: 'RF connectors & side bracket', sub: 'Exterior view', offset: [0.8, -0.35, 0.2], channel: 'labelsIroNav' },
  { anchor: 'int.enclosure', title: 'Enclosure structure', sub: 'Conceptual', offset: [0.85, -0.2, 0], channel: 'labelsInternals' },
  { anchor: 'int.chips', title: 'Processing components', sub: 'Illustrative', offset: [0.9, 0.3, 0.2], channel: 'labelsInternals' },
  { anchor: 'int.pcb', title: 'Circuit board', sub: 'Illustrative', offset: [-0.8, 0.1, 0.1], channel: 'labelsInternals', align: 'left' },
  { anchor: 'int.connectors', title: 'Connectors', sub: 'Conceptual', offset: [-0.75, -0.5, 0], channel: 'labelsInternals', align: 'left' },
  { anchor: 'int.interface', title: 'Electronic interfaces', sub: 'Illustrative', offset: [0.8, -0.35, 0.1], channel: 'labelsInternals', desktopOnly: true },
];

