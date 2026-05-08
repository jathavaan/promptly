export type TutorialPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TutorialStep {
  targetId?: string;
  title: string;
  body: string;
  placement?: TutorialPlacement;
}
