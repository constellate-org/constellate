// Themes are Atom One
// https://github.com/PrismJS/prism-themes

export const dark_css = `
/* Selection */
code[class*="language-"]::-moz-selection,
code[class*="language-"] *::-moz-selection,
pre[class*="language-"] *::-moz-selection {
  background: hsl(220, 13%, 28%);
  color: inherit;
  text-shadow: none;
}

code[class*="language-"]::selection,
code[class*="language-"] *::selection,
pre[class*="language-"] *::selection {
  background: hsl(220, 13%, 28%);
  color: inherit;
  text-shadow: none;
}

/* Code blocks */
pre[class*="language-"] {
  padding: 1em;
  margin: 0.5em 0;
  overflow: auto;
  border-radius: 0.3em;
}

/* Inline code */
:not(pre) > code[class*="language-"] {
  padding: 0.2em 0.3em;
  border-radius: 0.3em;
  white-space: normal;
}

/* Print */
@media print {
  code[class*="language-"],
  pre[class*="language-"] {
    text-shadow: none;
  }
}

code.euiCodeBlock__code .token.comment,
code.euiCodeBlock__code .token.prolog,
code.euiCodeBlock__code .token.cdata {
  color: hsl(220, 10%, 40%);
}

code.euiCodeBlock__code .token.doctype,
code.euiCodeBlock__code .token.punctuation,
code.euiCodeBlock__code .token.entity {
  color: hsl(220, 14%, 71%);
}

code.euiCodeBlock__code .token.attr-name,
code.euiCodeBlock__code .token.class-name,
code.euiCodeBlock__code .token.boolean,
code.euiCodeBlock__code .token.constant,
code.euiCodeBlock__code .token.number,
code.euiCodeBlock__code .token.atrule {
  color: hsl(29, 54%, 61%);
}

code.euiCodeBlock__code .token.keyword {
  color: hsl(286, 60%, 67%);
}

code.euiCodeBlock__code .token.property,
code.euiCodeBlock__code .token.tag,
code.euiCodeBlock__code .token.symbol,
code.euiCodeBlock__code .token.deleted,
code.euiCodeBlock__code .token.important {
  color: hsl(355, 65%, 65%);
}

code.euiCodeBlock__code .token.selector,
code.euiCodeBlock__code .token.string,
code.euiCodeBlock__code .token.char,
code.euiCodeBlock__code .token.builtin,
code.euiCodeBlock__code .token.inserted,
code.euiCodeBlock__code .token.regex,
code.euiCodeBlock__code .token.attr-value,
code.euiCodeBlock__code .token.attr-value > code.euiCodeBlock__code .token.punctuation {
  color: hsl(95, 38%, 62%);
}

code.euiCodeBlock__code .token.variable,
code.euiCodeBlock__code .token.operator,
code.euiCodeBlock__code .token.function {
  color: hsl(207, 82%, 66%);
}

code.euiCodeBlock__code .token.url {
  color: hsl(187, 47%, 55%);
}

/* HTML overrides */
code.euiCodeBlock__code .token.attr-value > code.euiCodeBlock__code .token.punctuation.attr-equals,
code.euiCodeBlock__code .token.special-attr > code.euiCodeBlock__code .token.attr-value > code.euiCodeBlock__code .token.value.css {
  color: hsl(220, 14%, 71%);
}

/* CSS overrides */
.language-css code.euiCodeBlock__code .token.selector {
  color: hsl(355, 65%, 65%);
}

.language-css code.euiCodeBlock__code .token.property {
  color: hsl(220, 14%, 71%);
}

.language-css code.euiCodeBlock__code .token.function,
.language-css code.euiCodeBlock__code .token.url > code.euiCodeBlock__code .token.function {
  color: hsl(187, 47%, 55%);
}

.language-css code.euiCodeBlock__code .token.url > code.euiCodeBlock__code .token.string.url {
  color: hsl(95, 38%, 62%);
}

.language-css code.euiCodeBlock__code .token.important,
.language-css code.euiCodeBlock__code .token.atrule code.euiCodeBlock__code .token.rule {
  color: hsl(286, 60%, 67%);
}

/* JS overrides */
.language-javascript code.euiCodeBlock__code .token.operator {
  color: hsl(286, 60%, 67%);
}

.language-javascript code.euiCodeBlock__code .token.template-string > code.euiCodeBlock__code .token.interpolation > code.euiCodeBlock__code .token.interpolation-punctuation.punctuation {
  color: hsl(5, 48%, 51%);
}

/* JSON overrides */
.language-json code.euiCodeBlock__code .token.operator {
  color: hsl(220, 14%, 71%);
}

.language-json code.euiCodeBlock__code .token.null.keyword {
  color: hsl(29, 54%, 61%);
}

/* MD overrides */
.language-markdown code.euiCodeBlock__code .token.url,
.language-markdown code.euiCodeBlock__code .token.url > code.euiCodeBlock__code .token.operator,
.language-markdown code.euiCodeBlock__code .token.url-reference.url > code.euiCodeBlock__code .token.string {
  color: hsl(220, 14%, 71%);
}

.language-markdown code.euiCodeBlock__code .token.url > code.euiCodeBlock__code .token.content {
  color: hsl(207, 82%, 66%);
}

.language-markdown code.euiCodeBlock__code .token.url > code.euiCodeBlock__code .token.url,
.language-markdown code.euiCodeBlock__code .token.url-reference.url {
  color: hsl(187, 47%, 55%);
}

.language-markdown code.euiCodeBlock__code .token.blockquote.punctuation,
.language-markdown code.euiCodeBlock__code .token.hr.punctuation {
  color: hsl(220, 10%, 40%);
  font-style: italic;
}

.language-markdown code.euiCodeBlock__code .token.code-snippet {
  color: hsl(95, 38%, 62%);
}

.language-markdown code.euiCodeBlock__code .token.bold code.euiCodeBlock__code .token.content {
  color: hsl(29, 54%, 61%);
}

.language-markdown code.euiCodeBlock__code .token.italic code.euiCodeBlock__code .token.content {
  color: hsl(286, 60%, 67%);
}

.language-markdown code.euiCodeBlock__code .token.strike code.euiCodeBlock__code .token.content,
.language-markdown code.euiCodeBlock__code .token.strike code.euiCodeBlock__code .token.punctuation,
.language-markdown code.euiCodeBlock__code .token.list.punctuation,
.language-markdown code.euiCodeBlock__code .token.title.important > code.euiCodeBlock__code .token.punctuation {
  color: hsl(355, 65%, 65%);
}

/* General */
code.euiCodeBlock__code .token.bold {
  font-weight: bold;
}

code.euiCodeBlock__code .token.comment,
code.euiCodeBlock__code .token.italic {
  font-style: italic;
}

code.euiCodeBlock__code .token.entity {
  cursor: help;
}

code.euiCodeBlock__code .token.namespace {
  opacity: 0.8;
}`;

export const light_css = `
/* Selection */
code[class*="language-"]::-moz-selection,
code[class*="language-"] *::-moz-selection,
pre[class*="language-"] *::-moz-selection {
  background: hsl(230, 1%, 90%);
  color: inherit;
}

code[class*="language-"]::selection,
code[class*="language-"] *::selection,
pre[class*="language-"] *::selection {
  background: hsl(230, 1%, 90%);
  color: inherit;
}

/* Code blocks */
pre[class*="language-"] {
  padding: 1em;
  margin: 0.5em 0;
  overflow: auto;
  border-radius: 0.3em;
}

/* Inline code */
:not(pre) > code[class*="language-"] {
  padding: 0.2em 0.3em;
  border-radius: 0.3em;
  white-space: normal;
}

code.euiCodeBlock__code .token.comment,
code.euiCodeBlock__code .token.prolog,
code.euiCodeBlock__code .token.cdata {
  color: hsl(230, 4%, 64%);
}

code.euiCodeBlock__code .token.doctype,
code.euiCodeBlock__code .token.punctuation,
code.euiCodeBlock__code .token.entity {
  color: hsl(230, 8%, 24%);
}

code.euiCodeBlock__code .token.attr-name,
code.euiCodeBlock__code .token.class-name,
code.euiCodeBlock__code .token.boolean,
code.euiCodeBlock__code .token.constant,
code.euiCodeBlock__code .token.number,
code.euiCodeBlock__code .token.atrule {
  color: hsl(35, 99%, 36%);
}

code.euiCodeBlock__code .token.keyword {
  color: hsl(301, 63%, 40%);
}

code.euiCodeBlock__code .token.property,
code.euiCodeBlock__code .token.tag,
code.euiCodeBlock__code .token.symbol,
code.euiCodeBlock__code .token.deleted,
code.euiCodeBlock__code .token.important {
  color: hsl(5, 74%, 59%);
}

code.euiCodeBlock__code .token.selector,
code.euiCodeBlock__code .token.string,
code.euiCodeBlock__code .token.char,
code.euiCodeBlock__code .token.builtin,
code.euiCodeBlock__code .token.inserted,
code.euiCodeBlock__code .token.regex,
code.euiCodeBlock__code .token.attr-value,
code.euiCodeBlock__code .token.attr-value > code.euiCodeBlock__code .token.punctuation {
  color: hsl(119, 34%, 47%);
}

code.euiCodeBlock__code .token.variable,
code.euiCodeBlock__code .token.operator,
code.euiCodeBlock__code .token.function {
  color: hsl(221, 87%, 60%);
}

code.euiCodeBlock__code .token.url {
  color: hsl(198, 99%, 37%);
}

/* HTML overrides */
code.euiCodeBlock__code .token.attr-value > code.euiCodeBlock__code .token.punctuation.attr-equals,
code.euiCodeBlock__code .token.special-attr > code.euiCodeBlock__code .token.attr-value > code.euiCodeBlock__code .token.value.css {
  color: hsl(230, 8%, 24%);
}

/* CSS overrides */
.language-css code.euiCodeBlock__code .token.selector {
  color: hsl(5, 74%, 59%);
}

.language-css code.euiCodeBlock__code .token.property {
  color: hsl(230, 8%, 24%);
}

.language-css code.euiCodeBlock__code .token.function,
.language-css code.euiCodeBlock__code .token.url > code.euiCodeBlock__code .token.function {
  color: hsl(198, 99%, 37%);
}

.language-css code.euiCodeBlock__code .token.url > code.euiCodeBlock__code .token.string.url {
  color: hsl(119, 34%, 47%);
}

.language-css code.euiCodeBlock__code .token.important,
.language-css code.euiCodeBlock__code .token.atrule code.euiCodeBlock__code .token.rule {
  color: hsl(301, 63%, 40%);
}

/* JS overrides */
.language-javascript code.euiCodeBlock__code .token.operator {
  color: hsl(301, 63%, 40%);
}

.language-javascript code.euiCodeBlock__code .token.template-string > code.euiCodeBlock__code .token.interpolation > code.euiCodeBlock__code .token.interpolation-punctuation.punctuation {
  color: hsl(344, 84%, 43%);
}

/* JSON overrides */
.language-json code.euiCodeBlock__code .token.operator {
  color: hsl(230, 8%, 24%);
}

.language-json code.euiCodeBlock__code .token.null.keyword {
  color: hsl(35, 99%, 36%);
}

/* MD overrides */
.language-markdown code.euiCodeBlock__code .token.url,
.language-markdown code.euiCodeBlock__code .token.url > code.euiCodeBlock__code .token.operator,
.language-markdown code.euiCodeBlock__code .token.url-reference.url > code.euiCodeBlock__code .token.string {
  color: hsl(230, 8%, 24%);
}

.language-markdown code.euiCodeBlock__code .token.url > code.euiCodeBlock__code .token.content {
  color: hsl(221, 87%, 60%);
}

.language-markdown code.euiCodeBlock__code .token.url > code.euiCodeBlock__code .token.url,
.language-markdown code.euiCodeBlock__code .token.url-reference.url {
  color: hsl(198, 99%, 37%);
}

.language-markdown code.euiCodeBlock__code .token.blockquote.punctuation,
.language-markdown code.euiCodeBlock__code .token.hr.punctuation {
  color: hsl(230, 4%, 64%);
  font-style: italic;
}

.language-markdown code.euiCodeBlock__code .token.code-snippet {
  color: hsl(119, 34%, 47%);
}

.language-markdown code.euiCodeBlock__code .token.bold code.euiCodeBlock__code .token.content {
  color: hsl(35, 99%, 36%);
}

.language-markdown code.euiCodeBlock__code .token.italic code.euiCodeBlock__code .token.content {
  color: hsl(301, 63%, 40%);
}

.language-markdown code.euiCodeBlock__code .token.strike code.euiCodeBlock__code .token.content,
.language-markdown code.euiCodeBlock__code .token.strike code.euiCodeBlock__code .token.punctuation,
.language-markdown code.euiCodeBlock__code .token.list.punctuation,
.language-markdown code.euiCodeBlock__code .token.title.important > code.euiCodeBlock__code .token.punctuation {
  color: hsl(5, 74%, 59%);
}

/* General */
code.euiCodeBlock__code .token.bold {
  font-weight: bold;
}

code.euiCodeBlock__code .token.comment,
code.euiCodeBlock__code .token.italic {
  font-style: italic;
}

code.euiCodeBlock__code .token.entity {
  cursor: help;
}

code.euiCodeBlock__code .token.namespace {
  opacity: 0.8;
}`;
