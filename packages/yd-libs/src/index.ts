export interface FormatWalletAddressOptions {
  /**
   * Number of characters to keep at the start of the address.
   * Defaults to 6, which includes the `0x` prefix and four characters after it.
   */
  prefixLength?: number;
  /**
   * Number of characters to keep at the end of the address.
   * Defaults to 4.
   */
  suffixLength?: number;
  /**
   * Placeholder used when the address is missing or invalid.
   */
  placeholder?: string;
}

const DEFAULT_PREFIX_LENGTH = 6;
const DEFAULT_SUFFIX_LENGTH = 4;
const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{4,}$/;

/**
 * Format a wallet address for display by keeping characters at the beginning and end.
 *
 * @example
 * ```ts
 * formatWalletAddress('0x1234567890abcdef'); // → "0x1234...cdef"
 * ```
 */
export function formatWalletAddress(
  address: string | undefined | null,
  options: FormatWalletAddressOptions = {}
): string {
  const { prefixLength = DEFAULT_PREFIX_LENGTH, suffixLength = DEFAULT_SUFFIX_LENGTH, placeholder = 'N/A' } = options;

  if (!address || typeof address !== 'string') {
    return placeholder;
  }

  const trimmed = address.trim();
  if (!ADDRESS_PATTERN.test(trimmed) || trimmed.length <= prefixLength + suffixLength) {
    return trimmed || placeholder;
  }

  const prefix = trimmed.slice(0, prefixLength);
  const suffix = trimmed.slice(-suffixLength);
  return `${prefix}...${suffix}`;
}

export const walletUtils = {
  formatWalletAddress
};
