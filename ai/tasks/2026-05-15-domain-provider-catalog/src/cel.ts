import type { CelContext, RuntimeValue } from './types';

type Token =
  | { kind: 'number'; value: number }
  | { kind: 'identifier'; value: string }
  | { kind: 'string'; value: string }
  | { kind: 'operator'; value: string };

export const evaluateCelSubset = (
  expression: string,
  context: CelContext,
): RuntimeValue => {
  const tokens = tokenize(expression);
  if (tokens.length === 0) {
    throw new Error('CEL expression is empty.');
  }

  let index = 0;

  const readOperand = (): RuntimeValue => {
    const token = tokens[index];
    if (!token) {
      throw new Error(`Expected operand at token ${index}.`);
    }
    index += 1;
    if (token.kind === 'number' || token.kind === 'string') {
      return token.value;
    }
    if (token.kind === 'identifier') {
      return readContextPath(token.value, context);
    }
    throw new Error(`Expected operand, got operator ${token.value}.`);
  };

  let current = readOperand();
  while (index < tokens.length) {
    const operator = tokens[index];
    if (!operator || operator.kind !== 'operator') {
      throw new Error(`Expected operator at token ${index}.`);
    }
    index += 1;
    const next = readOperand();
    current = applyOperator(operator.value, current, next);
  }
  return current;
};

const tokenize = (expression: string): Token[] => {
  const tokens: Token[] = [];
  const matcher =
    /\s*(>=|<=|==|!=|&&|\|\||[+*\/><-]|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[A-Za-z_][A-Za-z0-9_.]*|\d+(?:\.\d+)?)\s*/g;
  let match: RegExpExecArray | null;
  let consumed = 0;
  while ((match = matcher.exec(expression)) !== null) {
    const raw = match[1];
    consumed += match[0].length;
    if (/^\d/.test(raw)) {
      tokens.push({ kind: 'number', value: Number(raw) });
    } else if (
      (raw.startsWith('"') && raw.endsWith('"')) ||
      (raw.startsWith("'") && raw.endsWith("'"))
    ) {
      tokens.push({ kind: 'string', value: raw.slice(1, -1) });
    } else if (/^(>=|<=|==|!=|&&|\|\||[+*\/><-])$/.test(raw)) {
      tokens.push({ kind: 'operator', value: raw });
    } else {
      tokens.push({ kind: 'identifier', value: raw });
    }
  }
  if (consumed !== expression.length) {
    throw new Error(`Unsupported CEL subset expression: ${expression}`);
  }
  return tokens;
};

const readContextPath = (path: string, context: CelContext): RuntimeValue => {
  let current: RuntimeValue | undefined = context;
  for (const segment of path.split('.')) {
    if (
      current !== null &&
      typeof current === 'object' &&
      !Array.isArray(current) &&
      segment in current
    ) {
      current = current[segment];
    } else {
      throw new Error(`Missing CEL context path: ${path}`);
    }
  }
  return current;
};

const applyOperator = (
  operator: string,
  left: RuntimeValue,
  right: RuntimeValue,
): RuntimeValue => {
  switch (operator) {
    case '+':
      if (typeof left === 'number' && typeof right === 'number') {
        return left + right;
      }
      return `${left}${right}`;
    case '-':
      return requireNumber(left, operator) - requireNumber(right, operator);
    case '*':
      return requireNumber(left, operator) * requireNumber(right, operator);
    case '/':
      return requireNumber(left, operator) / requireNumber(right, operator);
    case '>':
      return requireNumber(left, operator) > requireNumber(right, operator);
    case '<':
      return requireNumber(left, operator) < requireNumber(right, operator);
    case '>=':
      return requireNumber(left, operator) >= requireNumber(right, operator);
    case '<=':
      return requireNumber(left, operator) <= requireNumber(right, operator);
    case '==':
      return left === right;
    case '!=':
      return left !== right;
    case '&&':
      return Boolean(left) && Boolean(right);
    case '||':
      return Boolean(left) || Boolean(right);
    default:
      throw new Error(`Unsupported CEL subset operator: ${operator}`);
  }
};

const requireNumber = (value: RuntimeValue, operator: string): number => {
  if (typeof value !== 'number') {
    throw new Error(`Operator ${operator} requires number operands.`);
  }
  return value;
};
