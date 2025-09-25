export interface FormatWalletAddressOptions {
  /** 保留地址前缀的字符数量，默认 6 位（含 0x）。 */
  prefixLength?: number;
  /** 保留地址末尾的字符数量，默认 4 位。 */
  suffixLength?: number;
  /** 分隔前缀与后缀的填充符，默认使用省略号。 */
  filler?: string;
  /** 当地址为空时返回的占位符。 */
  placeholder?: string;
  /** 是否将结果转为大写显示。 */
  uppercase?: boolean;
}

const HEX_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

export function formatWalletAddress(
  address: string | null | undefined,
  options: FormatWalletAddressOptions = {},
): string {
  const {
    prefixLength = 6,
    suffixLength = 4,
    filler = '···',
    placeholder = '未连接',
    uppercase = false,
  } = options;

  if (!address) {
    return placeholder;
  }

  const normalized = address.trim();
  if (!normalized) {
    return placeholder;
  }

  if (normalized.length <= prefixLength + suffixLength) {
    return uppercase ? normalized.toUpperCase() : normalized;
  }

  const prefix = normalized.slice(0, prefixLength);
  const suffix = normalized.slice(-suffixLength);
  const result = `${prefix}${filler}${suffix}`;
  return uppercase ? result.toUpperCase() : result;
}

export function isHexAddress(input: string | null | undefined): boolean {
  if (!input) {
    return false;
  }
  return HEX_ADDRESS_PATTERN.test(input.trim());
}

export function generateMockAddress(seed = Date.now()): string {
  let value = Math.abs(Number(seed) || Date.now());
  let hex = '';

  for (let index = 0; index < 40; index += 1) {
    value = (value * 9301 + 49297) % 233280;
    const digit = Math.floor((value / 233280) * 16);
    hex += digit.toString(16);
  }

  return `0x${hex}`;
}
