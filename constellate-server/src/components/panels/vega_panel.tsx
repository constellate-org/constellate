import { EuiCodeBlock, EuiTabbedContent, useEuiTheme } from "@elastic/eui";
import { Vega } from "react-vega";
import rho_dark from "../../../public/vega_rho_dark.json";
import rho_light from "../../../public/vega_rho_light.json";

export default function VegaPanel(props) {
  const { colorMode, euiTheme } = useEuiTheme();
  const { code, chart } = props;

  const configUrl =
    "public/vega_rho_" + colorMode.toLocaleLowerCase() + ".json";

  const tabs = [
    {
      id: "img",
      name: "Plot",
      content: (
        <div style={{ height: "100%", width: "100%" }}>
          {
            <Vega
              spec={chart}
              /*
                            // @ts-ignore */
              config={
                colorMode === "LIGHT" ? rho_light["config"] : rho_dark["config"]
              }
            />
          }
        </div>
      ),
    },
    {
      id: "code",
      name: "Code",
      className: "eui-fullHeight",
      content: (
        <EuiCodeBlock
          language="python"
          lineNumbers
          overflowHeight="100%"
          fontSize="m"
          paddingSize="m"
          isCopyable={true}
          isVirtualized
          className="codeBlockEmbed"
        >
          {code}
        </EuiCodeBlock>
      ),
    },
  ];

  return (
    <>
      <EuiTabbedContent
        tabs={tabs}
        initialSelectedTab={tabs[0]}
        className="eui-fullHeight"
        id="panelTabs"
        expand={true}
      />
    </>
  );
}
