import KaTeX from 'katex';

const macrosKatex = `
%% Setup used for KaTeX

\\renewcommand{\\R}{{\\mathbb{R}}}
\\newcommand{\\Q}{{\\mathbb{Q}}}
\\renewcommand{\\N}{{\\mathbb{N}}}
\\newcommand{\\C}{{\\mathbb{C}}}

\\newcommand{\\cblue}[1]{\\htmlClass{text-blue}{#1}}
\\newcommand{\\cgreen}[1]{\\htmlClass{text-green}{#1}}
\\newcommand{\\cyellow}[1]{\\htmlClass{text-yellow}{#1}}
\\newcommand{\\cred}[1]{\\htmlClass{text-red}{#1}}
\\newcommand{\\cpurple}[1]{\\htmlClass{text-purple}{#1}}
\\newcommand{\\cteal}[1]{\\htmlClass{text-teal}{#1}}
\\newcommand{\\cpink}[1]{\\htmlClass{text-pink}{#1}}
\\newcommand{\\clime}[1]{\\htmlClass{text-lime}{#1}}
\\newcommand{\\cbrown}[1]{\\htmlClass{text-brown}{#1}}
\\newcommand{\\cindigo}[1]{\\htmlClass{text-indigo}{#1}}

\\newcommand{\\cone}[1]{\\htmlClass{text-blue}{#1}}
\\newcommand{\\ctwo}[1]{\\htmlClass{text-green}{#1}}
\\newcommand{\\cthree}[1]{\\htmlClass{text-yellow}{#1}}
\\newcommand{\\cfour}[1]{\\htmlClass{text-red}{#1}}
\\newcommand{\\cfive}[1]{\\htmlClass{text-purple}{#1}}
\\newcommand{\\csix}[1]{\\htmlClass{text-teal}{#1}}
\\newcommand{\\cseven}[1]{\\htmlClass{text-pink}{#1}}
\\newcommand{\\ceight}[1]{\\htmlClass{text-lime}{#1}}
\\newcommand{\\cnine}[1]{\\htmlClass{text-brown}{#1}}
\\newcommand{\\cten}[1]{\\htmlClass{text-indigo}{#1}}
`;

const macros = {};

KaTeX.renderToString(macrosKatex, {
  globalGroup: true,
  macros: macros,
});

export default macros;
