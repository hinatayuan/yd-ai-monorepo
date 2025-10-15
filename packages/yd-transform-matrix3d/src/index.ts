type Matrix4 = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
];

export interface TransformToMatrixOptions {
  precision?: number; // 小数位数
}

const EPS = 1e-12;

export function identity(): Matrix4 {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];
}

export function multiply(a: Matrix4, b: Matrix4): Matrix4 {
  const out = new Array(16).fill(0) as Matrix4;
  // 列主序，索引 i + j*4 (i: 行, j: 列)
  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < 4; i++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[i + k * 4] * b[k + j * 4];
      }
      out[i + j * 4] = sum;
    }
  }
  return out;
}

function clampNearZero(n: number): number {
  return Math.abs(n) < EPS ? 0 : n;
}

function round(n: number, p: number): number {
  const m = Math.pow(10, p);
  return Math.round(n * m) / m;
}

function toRadians(v: number, unit: string | null): number {
  switch (unit) {
    case 'deg':
    case null:
      return (v * Math.PI) / 180;
    case 'rad':
      return v;
    case 'grad':
      return (v * Math.PI) / 200;
    case 'turn':
      return v * 2 * Math.PI;
    default:
      throw new Error(`不支持的角度单位: ${unit}`);
  }
}

function parseNumber(token: string): number {
  const m = token.trim().match(/^([+-]?(?:\d+\.?\d*|\.\d+))(?:[a-z%]+)?$/i);
  if (!m) throw new Error(`无法解析数字: ${token}`);
  return parseFloat(m[1]);
}

function parsePx(token: string): number {
  const t = token.trim();
  const m = t.match(/^([+-]?(?:\d+\.?\d*|\.\d+))(px)?$/i);
  if (!m) throw new Error(`仅支持 px，无法解析: ${token}`);
  return parseFloat(m[1]);
}

function parseAngle(token: string): number {
  const m = token.trim().match(/^([+-]?(?:\d+\.?\d*|\.\d+))(deg|rad|grad|turn)?$/i);
  if (!m) throw new Error(`无法解析角度: ${token}`);
  const v = parseFloat(m[1]);
  const unit = (m[2] || 'deg').toLowerCase();
  return toRadians(v, unit);
}

function matTranslate(tx = 0, ty = 0, tz = 0): Matrix4 {
  const out = identity();
  out[12] = tx; // m03
  out[13] = ty; // m13
  out[14] = tz; // m23
  return out;
}

function matScale(sx = 1, sy = 1, sz = 1): Matrix4 {
  const out = identity();
  out[0] = sx; // m00
  out[5] = sy; // m11
  out[10] = sz; // m22
  return out;
}

function matRotateX(rad: number): Matrix4 {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const out = identity();
  out[5] = c;  // m11
  out[9] = s;  // m12
  out[6] = -s; // m21
  out[10] = c; // m22
  return out;
}

function matRotateY(rad: number): Matrix4 {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const out = identity();
  out[0] = c;  // m00
  out[8] = s;  // m02
  out[2] = -s; // m20
  out[10] = c; // m22
  return out;
}

function matRotateZ(rad: number): Matrix4 {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const out = identity();
  out[0] = c;  // m00
  out[1] = s;  // m10
  out[4] = -s; // m01
  out[5] = c;  // m11
  return out;
}

function matRotateAxisAngle(x: number, y: number, z: number, rad: number): Matrix4 {
  // 归一化
  const len = Math.hypot(x, y, z) || 1;
  x /= len; y /= len; z /= len;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const t = 1 - c;

  // 行主矩阵（便于书写），最后再按列主序填入
  const m00 = t * x * x + c;
  const m01 = t * x * y - s * z;
  const m02 = t * x * z + s * y;

  const m10 = t * x * y + s * z;
  const m11 = t * y * y + c;
  const m12 = t * y * z - s * x;

  const m20 = t * x * z - s * y;
  const m21 = t * y * z + s * x;
  const m22 = t * z * z + c;

  const out = identity();
  // 按列主序写入：arr[i + j*4] = m_ij
  out[0] = m00; out[1] = m10; out[2] = m20; // 第0列
  out[4] = m01; out[5] = m11; out[6] = m21; // 第1列
  out[8] = m02; out[9] = m12; out[10] = m22; // 第2列
  return out;
}

function matSkewX(rad: number): Matrix4 {
  const t = Math.tan(rad);
  const out = identity();
  out[4] = t; // m01
  return out;
}

function matSkewY(rad: number): Matrix4 {
  const t = Math.tan(rad);
  const out = identity();
  out[1] = t; // m10
  return out;
}

function matPerspective(d: number): Matrix4 {
  // CSS: m[11] = -1/d in row-major at (3,2). 在列主序数组中位置是 arr[11]? 需要推导：m[23] (行=2,列=3) -> index 2 + 3*4 = 14。
  // 参照 W3C: perspective(d) => m[3][2] = -1/d （行3, 列2, 0基）
  // 对应 row-major m23。列主序索引为 index = 2 + 3*4 = 14。
  const out = identity();
  out[14] = -1 / d;
  return out;
}

function matFromMatrix2D(a: number, b: number, c: number, d: number, e: number, f: number): Matrix4 {
  // 2D matrix 对应 4x4（行主形态）：
  // [ a c 0 e ]
  // [ b d 0 f ]
  // [ 0 0 1 0 ]
  // [ 0 0 0 1 ]
  const out = identity();
  out[0] = a; // m00
  out[1] = b; // m10
  out[4] = c; // m01
  out[5] = d; // m11
  out[12] = e; // m03
  out[13] = f; // m13
  return out;
}

function parseArgsList(s: string): string[] {
  // 以逗号或空白分隔，但保留像 "10px"、"30deg" 这样的 token
  // 允许像 translate(10px 20px) 或 translate(10px, 20px)
  const parts = s
    .split(/,(?![^()]*\))|\s+/)
    .map(x => x.trim())
    .filter(Boolean);
  return parts;
}

function parseFunction(fn: string, rawArgs: string): Matrix4 {
  const name = fn.toLowerCase();
  const args = parseArgsList(rawArgs);

  switch (name) {
    case 'translate': {
      const tx = args[0] ? parsePx(args[0]) : 0;
      const ty = args[1] ? parsePx(args[1]) : 0;
      return matTranslate(tx, ty, 0);
    }
    case 'translatex': {
      const tx = args[0] ? parsePx(args[0]) : 0;
      return matTranslate(tx, 0, 0);
    }
    case 'translatey': {
      const ty = args[0] ? parsePx(args[0]) : 0;
      return matTranslate(0, ty, 0);
    }
    case 'translatez': {
      const tz = args[0] ? parsePx(args[0]) : 0;
      return matTranslate(0, 0, tz);
    }
    case 'translate3d': {
      const tx = args[0] ? parsePx(args[0]) : 0;
      const ty = args[1] ? parsePx(args[1]) : 0;
      const tz = args[2] ? parsePx(args[2]) : 0;
      return matTranslate(tx, ty, tz);
    }

    case 'scale': {
      const sx = args[0] != null ? parseNumber(args[0]) : 1;
      const sy = args[1] != null ? parseNumber(args[1]) : sx;
      return matScale(sx, sy, 1);
    }
    case 'scalex': {
      const sx = args[0] != null ? parseNumber(args[0]) : 1;
      return matScale(sx, 1, 1);
    }
    case 'scaley': {
      const sy = args[0] != null ? parseNumber(args[0]) : 1;
      return matScale(1, sy, 1);
    }
    case 'scalez': {
      const sz = args[0] != null ? parseNumber(args[0]) : 1;
      return matScale(1, 1, sz);
    }
    case 'scale3d': {
      const sx = args[0] != null ? parseNumber(args[0]) : 1;
      const sy = args[1] != null ? parseNumber(args[1]) : 1;
      const sz = args[2] != null ? parseNumber(args[2]) : 1;
      return matScale(sx, sy, sz);
    }

    case 'rotate': {
      const rad = parseAngle(args[0] || '0');
      return matRotateZ(rad);
    }
    case 'rotatex': {
      const rad = parseAngle(args[0] || '0');
      return matRotateX(rad);
    }
    case 'rotatey': {
      const rad = parseAngle(args[0] || '0');
      return matRotateY(rad);
    }
    case 'rotatez': {
      const rad = parseAngle(args[0] || '0');
      return matRotateZ(rad);
    }
    case 'rotate3d': {
      const x = args[0] != null ? parseNumber(args[0]) : 0;
      const y = args[1] != null ? parseNumber(args[1]) : 0;
      const z = args[2] != null ? parseNumber(args[2]) : 1;
      const rad = parseAngle(args[3] || '0');
      return matRotateAxisAngle(x, y, z, rad);
    }

    case 'skew': {
      const ax = args[0] ? parseAngle(args[0]) : 0;
      const ay = args[1] ? parseAngle(args[1]) : 0;
      // 等价于 skewX(ax) skewY(ay)
      return multiply(matSkewX(ax), matSkewY(ay));
    }
    case 'skewx': {
      const ax = args[0] ? parseAngle(args[0]) : 0;
      return matSkewX(ax);
    }
    case 'skewy': {
      const ay = args[0] ? parseAngle(args[0]) : 0;
      return matSkewY(ay);
    }

    case 'perspective': {
      const d = args[0] ? parsePx(args[0]) : 0;
      if (d === 0) throw new Error('perspective 的长度必须为非零 px');
      return matPerspective(d);
    }

    case 'matrix': {
      if (args.length !== 6) throw new Error('matrix(a,b,c,d,e,f) 需要 6 个参数');
      const [a, b, c, d, e, f] = args.map(parseNumber);
      return matFromMatrix2D(a, b, c, d, e, f);
    }
    case 'matrix3d': {
      if (args.length !== 16) throw new Error('matrix3d 需要 16 个参数');
      const vals = args.map(parseNumber) as unknown as Matrix4;
      return vals;
    }

    default:
      throw new Error(`不支持的 transform 方法: ${name}`);
  }
}

export function parseTransformToMatrix(transform: string): Matrix4 {
  // 支持形如："translate(10px, 20px) rotate(30deg) scale(2)"
  let acc = identity();
  const re = /(\w+)\(([^()]*)\)/g;
  const fns: Array<{ name: string; args: string }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(transform))) {
    fns.push({ name: m[1], args: m[2] });
  }
  if (fns.length === 0) {
    throw new Error('未解析到任何 transform 函数');
  }

  // CSS 规范：从右到左应用，但最终组合矩阵为 M = F1 * F2 * ... * Fn
  // 因此按出现顺序对累计矩阵做后乘。
  for (const { name, args } of fns) {
    const mat = parseFunction(name, args);
    acc = multiply(acc, mat);
  }
  return acc.map(clampNearZero) as Matrix4;
}

function normalizeNegZero(n: number): number {
  return Object.is(n, -0) ? 0 : n;
}

export function toMatrix3dString(m: Matrix4, precision = 6): string {
  const parts = m.map(v => normalizeNegZero(round(v, precision)));
  return `matrix3d(${parts.join(',')})`;
}

export function transformToMatrix3d(transform: string, options: TransformToMatrixOptions = {}) {
  const p = options.precision ?? 6;
  const m = parseTransformToMatrix(transform);
  return {
    matrix: m,
    css: toMatrix3dString(m, p)
  };
}

// 不再导出默认，避免构建告警，统一使用命名导出
