
import '@testing-library/jest-dom';
global.File = class File {
  name: string;
  type: string;
  size: number;
  constructor(content: string[], name: string, options: { type?: string } = {}) {
    this.name = name;
    this.type = options.type || '';
    this.size = content.reduce((acc, chunk) => acc + chunk.length, 0);
  }
} as any;
