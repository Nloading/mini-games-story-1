export const AVATAR_VARIANT_COUNT = 5;

const FALLBACK_INITIAL = '?';

/** Picks a random avatar-random token once per commenter, then keeps it for this picker's lifetime. */
export function createAvatarPicker(
  random: () => number = Math.random
): (commenterKey: string) => number {
  const assigned = new Map<string, number>();

  return (commenterKey) => {
    let variant = assigned.get(commenterKey);

    if (variant === undefined) {
      variant = Math.floor(random() * AVATAR_VARIANT_COUNT) + 1;
      assigned.set(commenterKey, variant);
    }

    return variant;
  };
}

export function getAvatarInitial(name: string): string {
  return Array.from(name.trim())[0]?.toUpperCase() ?? FALLBACK_INITIAL;
}
