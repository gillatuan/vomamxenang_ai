const ts = require('typescript');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/lib/rich-text.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
const mod = { exports: {} };
new Function('require', 'module', 'exports', source)(require, mod, mod.exports);
const { richTextHtml, richTextPlain } = mod.exports;

test('preserves formatting, links and existing Markdown/plain text', () => {
  assert.match(richTextHtml('**Đậm** và *nghiêng*'), /<strong>Đậm<\/strong> và <em>nghiêng<\/em>/);
  assert.match(richTextHtml('Dòng 1\nDòng 2'), /Dòng 1<br\s*\/?\s*>.*Dòng 2/s);
  assert.match(richTextHtml('<p><a href="https://example.com">Link</a></p>'), /href="https:\/\/example.com"/);
  assert.match(richTextHtml('<ol><li><u>Mục 1</u></li></ol>'), /<ol><li><u>Mục 1<\/u><\/li><\/ol>/);
});

test('removes executable markup and unsafe URLs', () => {
  for (const href of ['javascript:alert(1)', 'jav&#x61;script:alert(1)', 'data:text/html,test', '//example.com']) {
    assert.doesNotMatch(richTextHtml(`<a href="${href}">X</a>`), /href=/);
  }
  assert.doesNotMatch(richTextHtml('<script>alert(1)</script><img src=x onerror=alert(1)><p onclick="alert(1)">Text</p>'), /script|onerror|onclick|<img|alert/i);
});

test('produces readable excerpts and detects empty formatted content', () => {
  assert.equal(richTextPlain('<p>Một &amp; hai</p><p><strong>Ba</strong></p>'), 'Một & hai Ba');
  assert.equal(richTextPlain('<p><br></p>'), '');
  assert.equal(richTextPlain('<p>&nbsp;</p>'), '');
});
