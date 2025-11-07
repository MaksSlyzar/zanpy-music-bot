class Calculator {
  private tokens: string[];
  private index: number;

  constructor() {
    this.tokens = [];
    this.index = 0;
  }

  private peek(offset: number = 0) {
    return this.tokens[this.index + offset];
  }

  private skip() {
    if (this.index < this.tokens.length)
      this.index++;
  }

  private parseNumber(): number {
    const value = this.peek();
    this.skip();
    return Number(value);
  }

  private parseFactor(): number {
    let value: number = 0;

    if (this.peek() !== '(')
      value = this.parseNumber();
    else {
      this.skip();
      value = this.parseBase();
      if (this.peek() !== ")") {
        console.log("Missing \")\"");
      } else
        this.skip();
    }

    return value;
  }

  private parseTerm(): number {
    let value = this.parseFactor();

    while (true) {
      if (this.peek() == "*") {
        this.skip();
        value *= this.parseFactor();
      } else if (this.peek() == "/") {
        this.skip();
        value /= this.parseFactor();
      } else {
        break;
      }
    }

    return value;
  }

  private parseBase(): number {
    let value = this.parseTerm();

    while (true) {
      if (this.peek() == "+") {
        this.skip();
        value += this.parseTerm();
      } else if (this.peek() == "-") {
        this.skip();
        value -= this.parseTerm();
      } else {
        break;
      }
    }

    return value;
  }

  private parseExpression(): number {
    let value = this.parseBase();
    return value;
  }

  private lex(data: string) {
    const tokens: string[] = [];
    let current = 0;

    const isDigit = (ch: string) => /[0-9]/.test(ch);
    const isWhitespace = (ch: string) => /\s/.test(ch);

    while (current < data.length) {
      let char = data[current];

      if (isWhitespace(char)) {
        current++;
        continue;
      }

      if (/[+\-*/()]/.test(char)) {
        tokens.push(char);
        current++;
        continue;
      }

      if (isDigit(char)) {
        let num = '';
        while (isDigit(char) || char === '.') {
          num += char;
          char = data[++current];
        }
        tokens.push(num);
        continue;
      }

      throw new Error(`Unknown character: ${char}`);
    }

    this.tokens = tokens;
    this.index = 0;
  }

  public run(data: string) {
    this.lex(data);
    return this.parseExpression();
  }
}

export default Calculator;
