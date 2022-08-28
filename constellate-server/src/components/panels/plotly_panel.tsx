// @ts-nocheck

import {
    EuiCodeBlock,
    EuiLoadingChart,
    EuiTabbedContent,
    useEuiFontSize,
    useEuiTheme,
} from "@elastic/eui";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });
import plotlyPanelStyles from "./plotly_panel.styles";
import { merge } from "lodash";
import Script from "next/script";
import { useState } from "react";
import rhoLight from "../../../public/plotly_rho_light.json";
import rhoDark from "../../../public/plotly_rho_dark.json";

export default function PlotlyPanel(props) {
    const { fig, code } = props;
    const { data, layout } = fig;

    const styles = plotlyPanelStyles(useEuiTheme(), useEuiFontSize("m", "px"));

    layout["font"] = { family: styles.fontFamily };

    const [isLoaded, setIsLoaded] = useState(false);

    // remove plotly logo
    const config = { displaylogo: false };

    const tabs = [
        {
            id: "img",
            name: "Plot",
            content: (
                <>
                    {
                        !isLoaded && (
                            <EuiLoadingChart size="xl" />
                        )
                    }
                    {
                        // @ts-ignore
                        <Plot
                            data={data}
                            layout={merge(layout, styles.plotlyLayout)}
                            useResizeHandler={true}
                            config={config}
                            style={{ width: "100%", height: "100%" }}
                            onInitialized={
                                (fig, graphDiv) => {
                                    setIsLoaded(true);
                                }
                            }
                        />
                    }
                </>
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
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-AMS-MML_SVG" />
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
