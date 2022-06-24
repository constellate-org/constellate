import { Star } from "../../lib/constellate";
import CodePanel from "./code_panel";
import ImagePanel from "./image_panel";
import LatexPanel from "./latex_panel";
import PanelPanel from "./panel_panel";
import PlotlyPanel from "./plotly_panel";
import DFPanel from "./df_panel";
import WidgetPanel from "./widget_panel";
import VegaPanel from "./vega_panel";
import { to_strings } from "./df_panel";
import testHTML from "../../../public/testPyscript";

type PanelContentProps = {
  star: Star;
  panelUrl: string;
  isDark: boolean;
  uuid: string;
  slug: string;
};

export default function PanelContent(props: PanelContentProps) {
  switch (props.star.kind) {
    case "pure_markdown":
      return <></>;
    case "markdown_panel":
      return (
        <PanelPanel star={props.star} url={props.panelUrl} uuid={props.uuid} />
      );
    case "markdown_code": {
      return (
        <CodePanel
          code={props.star.code}
          output={props.star.output}
          lang={props.star.lang}
        ></CodePanel>
      );
    }
    case "markdown_latex":
      return <LatexPanel>{props.star.latex}</LatexPanel>;
    case "markdown_matplotlib":
      return (
        <ImagePanel
          url={props.star[props.isDark ? "dark" : "light"]}
          code={props.star.matplotlib}
        />
      );
    case "markdown_plotly":
      return <PlotlyPanel fig={props.star.figure} code={props.star.plotly} />;

    case "markdown_dataframe":
      return (
        <DFPanel data={to_strings(props.star.df_json)} code={props.star.code} />
      );

    case "markdown_vega":
      return <VegaPanel chart={props.star.chart} code={props.star.vega} />;

    case "markdown_widget":
      return <WidgetPanel html={testHTML} />;
  }
}
