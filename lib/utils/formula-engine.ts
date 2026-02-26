/**
 * Motor de evaluación seguro de fórmulas matemáticas
 *
 * Evalúa expresiones como:
 *   "(ancho/2)+4"           → 1004    (ancho=2000)
 *   "((4*ancho)+(6*alto))/1000" → 17  (ancho=2000, alto=1500)
 *   "25*(alto/1000)*(ancho/1000)" → 75 (ancho=2000, alto=1500)
 *
 * Seguro: NO usa eval(). Implementa un parser recursivo descendente.
 * Variables soportadas: ancho, alto, hojas, crucesH, crucesV
 */

export interface FormulaVariables {
  ancho: number;
  alto: number;
  hojas?: number;
  crucesH?: number;
  crucesV?: number;
}

export interface FormulaResult {
  value: number;
  error?: string;
}

export interface FormulaValidation {
  valid: boolean;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════
// TOKENIZER
// ═══════════════════════════════════════════════════════════════════

type TokenType =
  | "NUMBER"
  | "VARIABLE"
  | "OPERATOR"
  | "LPAREN"
  | "RPAREN"
  | "FUNCTION"
  | "COMMA";

interface Token {
  type: TokenType;
  value: string;
}

const VARIABLES = new Set(["ancho", "alto", "hojas", "crucesH", "crucesV"]);
const FUNCTIONS = new Set(["ceil", "floor", "round", "abs", "min", "max"]);

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = expr.replace(/\s+/g, ""); // strip whitespace

  while (i < s.length) {
    const ch = s[i];

    // Numbers (including decimals)
    if (/[0-9.]/.test(ch)) {
      let num = "";
      while (i < s.length && /[0-9.]/.test(s[i])) {
        num += s[i++];
      }
      tokens.push({ type: "NUMBER", value: num });
      continue;
    }

    // Identifiers (variables or functions)
    if (/[a-zA-Z_]/.test(ch)) {
      let id = "";
      while (i < s.length && /[a-zA-Z0-9_]/.test(s[i])) {
        id += s[i++];
      }
      if (FUNCTIONS.has(id)) {
        tokens.push({ type: "FUNCTION", value: id });
      } else if (VARIABLES.has(id)) {
        tokens.push({ type: "VARIABLE", value: id });
      } else {
        throw new Error(
          `Variable desconocida: "${id}". Variables válidas: ${[...VARIABLES].join(", ")}`,
        );
      }
      continue;
    }

    // Operators
    if ("+-*/".includes(ch)) {
      tokens.push({ type: "OPERATOR", value: ch });
      i++;
      continue;
    }

    // Parens
    if (ch === "(") {
      tokens.push({ type: "LPAREN", value: "(" });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "RPAREN", value: ")" });
      i++;
      continue;
    }

    // Comma (for multi-arg functions)
    if (ch === ",") {
      tokens.push({ type: "COMMA", value: "," });
      i++;
      continue;
    }

    throw new Error(`Carácter inválido: "${ch}" en posición ${i}`);
  }

  return tokens;
}

// ═══════════════════════════════════════════════════════════════════
// RECURSIVE DESCENT PARSER
// ═══════════════════════════════════════════════════════════════════

class Parser {
  private tokens: Token[];
  private pos: number;
  private vars: FormulaVariables;

  constructor(tokens: Token[], vars: FormulaVariables) {
    this.tokens = tokens;
    this.pos = 0;
    this.vars = vars;
  }

  private peek(): Token | null {
    return this.pos < this.tokens.length ? this.tokens[this.pos] : null;
  }

  private consume(expectedType?: TokenType): Token {
    const token = this.tokens[this.pos];
    if (!token) throw new Error("Expresión incompleta");
    if (expectedType && token.type !== expectedType) {
      throw new Error(
        `Se esperaba ${expectedType}, pero se encontró ${token.type} ("${token.value}")`,
      );
    }
    this.pos++;
    return token;
  }

  parse(): number {
    const result = this.parseExpression();
    if (this.pos < this.tokens.length) {
      throw new Error(`Token inesperado: "${this.tokens[this.pos].value}"`);
    }
    return result;
  }

  // expression = term (('+' | '-') term)*
  private parseExpression(): number {
    let left = this.parseTerm();

    while (
      this.peek()?.type === "OPERATOR" &&
      (this.peek()!.value === "+" || this.peek()!.value === "-")
    ) {
      const op = this.consume().value;
      const right = this.parseTerm();
      left = op === "+" ? left + right : left - right;
    }

    return left;
  }

  // term = unary (('*' | '/') unary)*
  private parseTerm(): number {
    let left = this.parseUnary();

    while (
      this.peek()?.type === "OPERATOR" &&
      (this.peek()!.value === "*" || this.peek()!.value === "/")
    ) {
      const op = this.consume().value;
      const right = this.parseUnary();
      if (op === "/" && right === 0) throw new Error("División por cero");
      left = op === "*" ? left * right : left / right;
    }

    return left;
  }

  // unary = ('-')? primary
  private parseUnary(): number {
    if (this.peek()?.type === "OPERATOR" && this.peek()!.value === "-") {
      this.consume();
      return -this.parsePrimary();
    }
    return this.parsePrimary();
  }

  // primary = NUMBER | VARIABLE | FUNCTION '(' args ')' | '(' expression ')'
  private parsePrimary(): number {
    const token = this.peek();
    if (!token) throw new Error("Expresión incompleta");

    // Number
    if (token.type === "NUMBER") {
      this.consume();
      const num = parseFloat(token.value);
      if (isNaN(num)) throw new Error(`Número inválido: "${token.value}"`);
      return num;
    }

    // Variable
    if (token.type === "VARIABLE") {
      this.consume();
      const val = this.vars[token.value as keyof FormulaVariables];
      if (val === undefined)
        throw new Error(`Variable "${token.value}" no definida`);
      return val;
    }

    // Function call
    if (token.type === "FUNCTION") {
      const funcName = this.consume().value;
      this.consume("LPAREN");
      const args: number[] = [];

      if (this.peek()?.type !== "RPAREN") {
        args.push(this.parseExpression());
        while (this.peek()?.type === "COMMA") {
          this.consume();
          args.push(this.parseExpression());
        }
      }

      this.consume("RPAREN");
      return this.callFunction(funcName, args);
    }

    // Grouped expression
    if (token.type === "LPAREN") {
      this.consume();
      const result = this.parseExpression();
      this.consume("RPAREN");
      return result;
    }

    throw new Error(`Token inesperado: "${token.value}"`);
  }

  private callFunction(name: string, args: number[]): number {
    switch (name) {
      case "ceil":
        if (args.length !== 1) throw new Error("ceil() requiere 1 argumento");
        return Math.ceil(args[0]);
      case "floor":
        if (args.length !== 1) throw new Error("floor() requiere 1 argumento");
        return Math.floor(args[0]);
      case "round":
        if (args.length !== 1) throw new Error("round() requiere 1 argumento");
        return Math.round(args[0]);
      case "abs":
        if (args.length !== 1) throw new Error("abs() requiere 1 argumento");
        return Math.abs(args[0]);
      case "min":
        if (args.length < 2)
          throw new Error("min() requiere al menos 2 argumentos");
        return Math.min(...args);
      case "max":
        if (args.length < 2)
          throw new Error("max() requiere al menos 2 argumentos");
        return Math.max(...args);
      default:
        throw new Error(`Función desconocida: "${name}"`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════

/**
 * Evalúa una fórmula con las variables dadas.
 * Retorna { value, error? }
 */
export function evaluateFormula(
  expr: string,
  vars: FormulaVariables,
): FormulaResult {
  if (!expr || expr.trim() === "") {
    return { value: 0, error: "Fórmula vacía" };
  }

  try {
    const tokens = tokenize(expr);
    const parser = new Parser(tokens, vars);
    const value = parser.parse();

    if (!isFinite(value)) {
      return { value: 0, error: "Resultado no finito (infinito o NaN)" };
    }

    return { value };
  } catch (e: any) {
    return { value: 0, error: e.message || "Error desconocido" };
  }
}

/**
 * Valida una fórmula sin evaluarla (usa valores dummy).
 */
export function validateFormula(expr: string): FormulaValidation {
  if (!expr || expr.trim() === "") {
    return { valid: true }; // Empty is valid (means "no formula")
  }

  const dummyVars: FormulaVariables = {
    ancho: 1000,
    alto: 1000,
    hojas: 2,
    crucesH: 0,
    crucesV: 0,
  };

  const result = evaluateFormula(expr, dummyVars);
  if (result.error) {
    return { valid: false, error: result.error };
  }
  return { valid: true };
}

/**
 * Preview: evalúa y retorna un string descriptivo con el resultado.
 */
export function previewFormula(
  expr: string,
  ancho: number = 2000,
  alto: number = 1500,
  hojas: number = 2,
): string {
  if (!expr || expr.trim() === "") return "—";

  const result = evaluateFormula(expr, {
    ancho,
    alto,
    hojas,
    crucesH: 0,
    crucesV: 0,
  });
  if (result.error) return `⚠ ${result.error}`;

  // Format to max 4 decimal places, removing trailing zeros
  const formatted = parseFloat(result.value.toFixed(4)).toString();
  return formatted;
}

/**
 * Lista de variables disponibles con descripciones
 */
export const FORMULA_VARIABLES = [
  { name: "ancho", desc: "Ancho del vano en mm", example: 2000 },
  { name: "alto", desc: "Alto del vano en mm", example: 1500 },
  { name: "hojas", desc: "Número de hojas del modelo", example: 2 },
  { name: "crucesH", desc: "Número de cruces horizontales", example: 0 },
  { name: "crucesV", desc: "Número de cruces verticales", example: 0 },
] as const;

/**
 * Funciones disponibles
 */
export const FORMULA_FUNCTIONS = [
  { name: "ceil(x)", desc: "Redondea hacia arriba", example: "ceil(3.2) → 4" },
  { name: "floor(x)", desc: "Redondea hacia abajo", example: "floor(3.8) → 3" },
  {
    name: "round(x)",
    desc: "Redondea al entero más cercano",
    example: "round(3.5) → 4",
  },
  { name: "abs(x)", desc: "Valor absoluto", example: "abs(-5) → 5" },
  {
    name: "min(a,b)",
    desc: "Mínimo entre dos valores",
    example: "min(3, 5) → 3",
  },
  {
    name: "max(a,b)",
    desc: "Máximo entre dos valores",
    example: "max(3, 5) → 5",
  },
] as const;
