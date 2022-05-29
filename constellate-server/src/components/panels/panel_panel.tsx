import React from "react";
import {
  withEuiTheme,
  EuiCodeBlock,
  EuiTabbedContent,
  UseEuiTheme,
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

class PanelPanelInner extends React.Component<PanelProps> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.loadPlot(true);
    console.log("7");
  }

  loadPlot(force: boolean) {
    const { colorMode } = this.props.theme;
    const plot = document.getElementById(`imgEmbedContent${colorMode}`);
    if (!plot || plot.innerHTML === "") {
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
      xhr.setRequestHeader("Access-Control-Allow-Origin", "localhost:3000");
      xhr.setRequestHeader("ColorMode", colorMode);

      const script_id = this.props.uuid + colorMode;
      xhr.onload = function (event) {
        console.log("1");
        if (
          document !== undefined &&
          (!document.getElementById(script_id) || force)
        ) {
          const script = document.createElement("script");
          script.id = script_id;
          const src = (event.target as XMLHttpRequest).response;
          script.innerHTML = src.replaceAll(
            `"static/extensions/panel`,
            `"${url}/static/extensions/panel`
          );
          console.log("2", script);
          document.body.appendChild(script);
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
        content: (
          <div id="imgEmbedContainer">
            <div
              id={`imgEmbedContent${colorMode}`}
              css={styles.embedContent}
            ></div>
            <div
              id={`imgEmbedContent${invColorMode}`}
              css={styles.embedContent}
              style={{ visibility: "hidden" }}
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

    if (typeof document !== "undefined") {
      const embed = document.getElementById(this.props.uuid + invColorMode);
      console.log("3");
      if (embed) {
        console.log("4");
        if (document.getElementById(`imgEmbedContent${invColorMode}`)) {
          document.getElementById(`imgEmbedContent${invColorMode}`).innerHTML =
            "";
        }
        this.loadPlot(false);
        console.log("6");
      }
    }

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
              this.loadPlot(true);
              console.log("5");
            } else {
              if (document.getElementById(`imgEmbedContent${invColorMode}`)) {
                document.getElementById(
                  `imgEmbedContent${invColorMode}`
                ).innerHTML = "";
              }
              // document.getElementById(this.props.uuid + colorMode).remove();
            }
          }}
        />
      </>
    );
  }
}

export default withEuiTheme(PanelPanelInner);
