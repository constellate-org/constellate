import React, { useEffect, useState } from "react";
import {
    withEuiTheme,
    EuiTabbedContent,
    UseEuiTheme,
    EuiLoadingChart,
    EuiThemeColorMode,
    useEuiTheme,
    EuiPanel,
    EuiFlexGroup,
} from "@elastic/eui";
import { MarkdownPanel } from "../../lib/constellate";
import panelOverrides from '../../styles/panel_overrides';
import Script from "next/script";
import { render } from "react-dom";
import SrcBlock from "./src_block";
import panelPanelStyles from "./panel_panel.styles";

type PanelProps = {
    star: MarkdownPanel;
    uuid: string;
    url: string;
    theme: UseEuiTheme;
    subdomain: string;
};

type PanelState = {
    plotLoaded: true
}

export default function PanelPanel(props: PanelProps) {
    const [plotLoaded, setPlotLoaded] = useState(false);
    const [plotData, setPlotData] = useState("");
    const theme = useEuiTheme();
    const styles = panelPanelStyles(theme);
    const colorMode = `${theme.colorMode}`.toLocaleLowerCase();

    const url = `${props.url}/${props.star.star_id}?colorMode=${colorMode}`


    const tabs = [
        {
            id: "img",
            name: "Plot",
            content: (
                <EuiPanel style={{
                    height: '100%',
                    width: '100%',
                }}>
                    <EuiFlexGroup id="imgEmbedContainer" style={{
                        height: '100%',
                        width: '100%'
                    }}>
                        <iframe id='panelFrame' src={url} style={{
                            flexGrow: 1
                        }} />
                    </EuiFlexGroup>
                </EuiPanel>
            ),
        },
        {
            id: "code",
            name: "Code",
            className: "eui-fullHeight",
            content: (
                <SrcBlock>
                    {props.star.panel}
                </SrcBlock>
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
                aria-label="Panel Tabs"
                expand={true}
                css={styles.tabPanel}
                onTabClick={(tab) => {
                    if (tab.id == "img") {
                        setPlotLoaded(false);
                        setPlotData("");
                        console.log("5");
                    } else {
                    }
                }}
            />
        </>
    );
}
