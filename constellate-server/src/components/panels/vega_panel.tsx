import { EuiCodeBlock, EuiPanel, EuiTabbedContent, UseEuiTheme, useEuiTheme, withEuiTheme } from "@elastic/eui";
import { Vega } from "react-vega";
import rho_dark from "../../../public/vega_rho_dark.json";
import rho_light from "../../../public/vega_rho_light.json";
import React from "react";
import { Handler } from 'vega-tooltip';

type VegaProps = {
    code: any;
    chart: any;
    theme: UseEuiTheme;
}

class VegaPanelInner extends React.Component<VegaProps> {
    constructor(props: VegaProps) {
        super(props);
    }

    render() {
        const { colorMode, euiTheme } = this.props.theme;
        const { code, chart } = this.props;

        chart['config'] = colorMode === "LIGHT" ? rho_light["config"] : rho_dark["config"];

        const tabs = [
            {
                id: "img",
                name: "Plot",
                content: (
                    <div style={{ 'overflow': 'scroll', 'width': '100%', 'height': '100%' }}>
                        {process.browser && (
                            <Vega
                                spec={chart}
                                tooltip={new Handler({
                                    theme: colorMode === "LIGHT" ? "light" : "dark"
                                }).call}
                            />
                        )}
                    </div>
                )
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
}

export default withEuiTheme(VegaPanelInner);
