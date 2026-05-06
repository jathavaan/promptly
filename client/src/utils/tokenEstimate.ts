// Rough heuristic: ~4 chars per token for English/code mix.
export const estimateTokens = (text: string): number => Math.ceil(text.length / 4);

export const formatCount = (chars: number): string => {
  const tokens = estimateTokens(chars === 0 ? '' : 'x'.repeat(chars));
  return `${chars.toLocaleString()} chars · ~${tokens.toLocaleString()} tokens`;
};
