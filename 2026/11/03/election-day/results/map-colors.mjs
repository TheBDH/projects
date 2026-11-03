export const safeColor = value => /^#[0-9a-f]{6}$/i.test(value || '') ? value : '#686868';

export function leadOf(record) {
  if (!record?.total) return null;
  const order = record.votes.map((votes, index) => ({ votes, index })).sort((a, b) => b.votes - a.votes);
  const first = order[0], second = order[1]?.votes || 0;
  const indices = order.filter(choice => choice.votes === first.votes).map(choice => choice.index);
  return { index: first.index, indices, tie: indices.length > 1, margin: (first.votes - second) / record.total };
}

export function leaderColors(record, choices) {
  return leadOf(record)?.indices.map(index => safeColor(choices[index]?.color)) || [];
}

export function tint(hex, strength) {
  const base = safeColor(hex).slice(1);
  return `rgb(${[0, 2, 4].map(index => Math.round(255 + (parseInt(base.slice(index, index + 2), 16) - 255) * strength)).join(',')})`;
}
