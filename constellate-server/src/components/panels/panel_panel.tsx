import React from "react";
import {
    withEuiTheme,
    EuiCodeBlock,
    EuiTabbedContent,
    UseEuiTheme,
    EuiLoadingChart,
    EuiThemeColorMode,
} from "@elastic/eui";
import { MarkdownPanel } from "../../lib/constellate";
import panelPanelStyles from "./panel_panel.styles";
import Script from "next/script";
import { render } from "react-dom";

type PanelProps = {
    star: MarkdownPanel;
    uuid: string;
    url: string;
    theme: UseEuiTheme;
    subdomain: string;
};

type PanelState = {
    plotLoaded: boolean;
    currColorMode: EuiThemeColorMode;
}

class PanelPanelInner extends React.Component<PanelProps, PanelState> {
    constructor(props) {
        super(props);
        this.state = {
            plotLoaded: false,
            currColorMode: this.props.theme.colorMode
        };
        console.log("7");
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            plotLoaded: (prevState.plotLoaded && nextProps.theme.colorMode === prevState.currColorMode),
            currColorMode: (nextProps.theme.colorMode)
        }
    }


    isPlotThere() {
        const { colorMode } = this.props.theme;
        if (typeof document !== "undefined") {
            const plot = document.getElementById(`imgEmbedContent${colorMode}`);
            if (!plot || plot.innerHTML === "") {
                return false;
            } else {
                return true;
            }
        }
        return false;
    }

    componentDidMount() {
        console.log("1");
        if (!this.isPlotThere()) {
            console.log("2");
            this.loadPlot(false);
        }
    }

    componentWillUnmount() {
        console.log("11");
        const { colorMode } = this.props.theme;
        if (this.isPlotThere()) {
            console.log("12");
            const plot = document.getElementById(`imgEmbedContent${colorMode}`);
            plot.innerHTML = "";
        }
    }

    componentDidUpdate(prevProps) {
        console.log("3");
        if (prevProps.theme.colorMode !== this.props.theme.colorMode) {
            console.log("6");
            this.loadPlot(false);
        }
    }

    loadPlot(force: boolean) {
        let { colorMode } = this.props.theme;
        console.log("8", colorMode);
        if (!this.isPlotThere()) {
            console.log("10");
            const xhr = new XMLHttpRequest();
            xhr.responseType = "text";

            const url = this.props.url;
            const path = `${this.props.star.star_id}`;
            xhr.open(
                "GET",
                `${url}/${path}/autoload.js?bokeh-autoload-element=imgEmbedContent${colorMode}&bokeh-app-path=/${path}&bokeh-absolute-url=${url}/${path}&colorMode=${colorMode.toLocaleLowerCase()}`,
                true
            );
            xhr.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0");
            xhr.setRequestHeader("Bokeh-Session-Id", this.props.uuid + colorMode);
            xhr.setRequestHeader("ColorMode", colorMode);

            const script_id = this.props.uuid + colorMode;
            const updateState = () => {
                this.setState({
                    plotLoaded: true
                });
            };

            const getState = () => {
                return this.state.plotLoaded
            };
            xhr.onload = function (event) {
                console.log("1");
                if ((typeof document !== "undefined" && (!getState() || force))) {
                    const script = document.createElement("script");
                    if (
                        typeof document !== "undefined" &&
                        document.getElementById(script_id)
                    ) {
                        document.getElementById(script_id).remove();
                    }
                    script.id = script_id;
                    const src = (event.target as XMLHttpRequest).response;
                    script.innerHTML = src.replaceAll(
                        `"static/extensions/panel`,
                        `"${url}/static/extensions/panel`
                    );

                    if (
                        (typeof document !== "undefined" && (!getState() || force))
                    ) {
                        console.log("2", script);
                        document.body.appendChild(script);
                        updateState();
                    }
                }
            };
            xhr.send();
        }
    }

    render() {
        const styles = panelPanelStyles(this.props.theme);
        const { colorMode } = this.props.theme;
        const invColorMode = colorMode == "DARK" ? "LIGHT" : "DARK";
        const tabs = [
            {
                id: "img",
                name: "Plot",
                content: !this.state.plotLoaded ? (
                    <div id="imgEmbedContainer" className="isLoading">
                        <EuiLoadingChart size="xl" />
                    </div>
                ) : (
                    <div id="imgEmbedContainer">
                        <div
                            id={`imgEmbedContentLIGHT`}
                            css={styles.embedContent}
                            style={{
                                display: colorMode === "LIGHT" ? "block" : "none",
                            }}
                        ></div>
                        <div
                            id={`imgEmbedContentDARK`}
                            css={styles.embedContent}
                            style={{
                                display: colorMode === "DARK" ? "block" : "none",
                            }}
                        ></div>
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
                        id="codeBlockEmbed"
                    >
                        {this.props.star.panel}
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
                    aria-label="Panel Tabs"
                    expand={true}
                    css={styles.tabPanel}
                    onTabClick={(tab) => {
                        if (tab.id == "img") {
                            this.setState({
                                plotLoaded: false
                            });
                            this.loadPlot(false);
                            console.log("5");
                        } else {
                        }
                    }}
                />
            </>
        );
    }
}

export default withEuiTheme(PanelPanelInner);
