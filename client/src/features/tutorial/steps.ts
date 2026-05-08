import type { TutorialStep } from './tutorial.types';

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to promptly',
    body: 'Build XML-tagged prompts for Claude, ChatGPT, and other LLMs. This quick tour walks through the main features. Use Next/Back, or press Esc to skip.',
  },
  {
    targetId: 'settings-panel',
    title: 'Settings',
    body: 'Set the role primer (rendered as <role> at the top of the prompt), append "think step by step" or self-critique instructions, and pick an output-format template.',
    placement: 'right',
  },
  {
    targetId: 'tags-panel',
    title: 'Tags',
    body: 'Each tag becomes an XML element. Pick text, list, checkbox, or example pairs. Drag to reorder, indent for nesting, lock as a static field, or pin frequent ones.',
    placement: 'right',
  },
  {
    targetId: 'add-controls',
    title: 'Adding tags',
    body: '"Add preset" gives common starter tags (context, task, rules, output_format…). "Add tag" creates a blank one you can name yourself. The starter layout seeds a full prompting scaffold.',
    placement: 'top',
  },
  {
    targetId: 'preview-panel',
    title: 'Live preview',
    body: 'Generated XML updates as you type. Char and token counts show at the top. Validation errors surface here before you can copy.',
    placement: 'left',
  },
  {
    targetId: 'preview-actions',
    title: 'Copy & export',
    body: 'Copy raw XML, copy wrapped in a Markdown code fence, download as .xml, or import a previous prompt to keep iterating.',
    placement: 'bottom',
  },
  {
    targetId: 'library-button',
    title: 'Library',
    body: 'Save the current state as a prompt or template. Load saved items back into the editor whenever you want to reuse or branch.',
    placement: 'bottom',
  },
  {
    targetId: 'tutorial-button',
    title: 'Replay anytime',
    body: 'Click this icon to replay the tour. That’s it — happy prompting.',
    placement: 'bottom',
  },
];
