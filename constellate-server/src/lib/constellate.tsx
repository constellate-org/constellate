export type MarkdownMatplotlib = {
  kind: 'markdown_matplotlib';
  star_id: string;
  markdown: string;
  matplotlib: string;
  light?: string;
  dark?: string;
};

export type MarkdownLatex = {
  kind: 'markdown_latex';
  star_id: string;
  markdown: string;
  latex: string;
};

export type MarkdownPanel = {
  kind: 'markdown_panel';
  star_id: string;
  markdown: string;
  panel: string;
};

export type MarkdownPlotly = {
  kind: 'markdown_plotly';
  star_id: string;
  markdown: string;
  plotly: string;
  figure: {
    data: Array<Record<string, unknown>>;
    layout: Record<string, unknown>;
  };
};

export type PureMarkdown = {
  kind: 'pure_markdown';
  star_id: string;
  markdown: string;
};

export type MarkdownCode = {
  kind: 'markdown_code';
  star_id: string;
  markdown: string;
  code: string;
  output: string | undefined;
  lang: string;
};

export type MarkdownDataframe = {
  kind: 'markdown_dataframe';
  star_id: string;
  markdown: string;
  code: string;
  df_json: Array<Record<string, unknown>>;
};

export type Star =
  | PureMarkdown
  | MarkdownMatplotlib
  | MarkdownLatex
  | MarkdownPanel
  | MarkdownPlotly
  | MarkdownCode
  | MarkdownDataframe;

export type Constellation = {
  setup_matplotlib: Array<string>;
  setup_panel: Array<string>;
  setup_plotly: Array<string>;
  setup_dataframe: Array<string>;
  stars: Array<Star>;
  breadcrumbs: Array<Array<number>>;
  title: string;
  slug: string;
  star_titles: Array<string>;
};

export function hasImgPanel(star: Star) {
  return star.kind != 'pure_markdown';
}
