import { describe, expect, it } from 'vitest';
import { sanitizeMetadata } from '@agnostic/engine-core';

describe('sanitizeMetadata', () => {
  it('removes disallowed tags and strips attributes from allowed tags', () => {
    const sanitized = sanitizeMetadata(
      "<b onclick='x()'>Bold</b><script>alert(1)</script><STRONG style='x'>Safe</STRONG>",
    );

    expect(sanitized).toBe('<b>Bold</b>alert(1)<strong>Safe</strong>');
  });

  it('sanitizes nested objects and arrays while preserving non-strings', () => {
    const sanitized = sanitizeMetadata({
      title: "<i class='x'>Title</i>",
      rows: [{ a: '<img src=x onerror=alert(1)>', b: 7 }],
      flag: true,
    });

    expect(sanitized).toEqual({
      title: '<i>Title</i>',
      rows: [{ a: '', b: 7 }],
      flag: true,
    });
  });
});
