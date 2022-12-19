import React from "react";
import {
    withEuiTheme,
    WithEuiThemeProps,
    EuiIcon,
    EuiText,
    useEuiTheme,
    transparentize,
    shade,
    tint,
    useEuiFontSize,
} from "@elastic/eui";
import { css, Global } from "@emotion/react";
import { light_css, dark_css } from "./code_block_themes";
import { light_color_css, dark_color_css } from "./color_classes";
import themes from "../../public/constellate_themes/themes";
import panelThemes from "./panel_overrides";

const theme = themes[process.env.CONSTELLATE_THEME];

export default function CustomStyling() {
    const { euiTheme, colorMode } = useEuiTheme();
    let t = euiTheme;

    let primaryBg, accentBg, colors;
    if (colorMode == "DARK") {
        // we can't dilute this as much or we run out of colors and we get banding issues
        primaryBg = shade(t.colors.primary, 0.4);
        accentBg = shade(t.colors.accent, 0.4);
        colors = dark_css + '\n' + dark_color_css;
    } else {
        primaryBg = tint(t.colors.primary, 0.5);
        accentBg = tint(t.colors.accent, 0.5);
        colors = light_css + '\n' + light_color_css;
    }

    const styles = css`
        ${colors}

    ${panelThemes(t)}

    html {
      font-feature-settings: ${t.font.featureSettings};
    }

    kbd {
        border-width: 0 !important;
        border-radius: ${t.border.radius.small};
    }

    kbd::after {
        /* EUI adds a border to the bottom, but it neglects to deal with nested kbds */
        border-width: 0px !important;
    }

    kbd > kbd::after {
        border-bottom-width: ${t.border.width.thin} !important;
    }

    kbd > kbd {
        border-bottom-width: ${t.border.thick} !important;
        border-bottom-color: ${t.colors.darkShade} !important;
        border-radius: ${t.border.radius};
        background-color: ${t.colors.lightShade};
        color: ${t.colors.fullShade};
        padding-block-end: 6px !important;
    }

    .euiText code.euiCode {
        font-family: ${t.font.familyCode};
    }
        #textContent {
        border-color: ${t.colors.lightShade};
        font-family: ${theme.text_font || t.font.family};
        ${useEuiFontSize("l").fontSize}
    }

    #textContent h1, #textContent h2, #textContent h3, #textContent h4 {
      font-family: ${t.font.family};
    }

    #pageHeader {
       background-color: ${t.colors.emptyShade};
    }

        .no-invert-bg.euiControlBar {
        background-color: ${t.colors.body};
        box-shadow: none;
        color: ${t.colors.text};
    }

        .no-invert-bg.euiControlBar.euiControlBar__text {
        color: ${t.colors.subduedText};
    }

        .no-invert-bg.euiControlBar.euiControlBar__breadcrumbs.euiBreadcrumb::after {
        background-color: ${t.colors.subduedText};
    }

        .no-invert-bg.euiControlBar euiControlBar__breadcrumbs.euiBreadcrumb: not(.euiBreadcrumb--last).euiBreadcrumb__content,
        .no-invert-bg.euiControlBar.euiControlBar__breadcrumbs.euiBreadcrumb: not(.euiBreadcrumb--last).euiBreadcrumb__content {
        color: ${t.colors.subduedText};
    }


        .sunmoon-grp label.euiButtonGroupButton-isSelected {
        color: ${t.colors.disabledText};
    }

        .euiSideNavItem.euiSideNavItem--trunk {
        color: ${euiTheme.colors.subduedText};
    }

        .currItem.euiSideNavItem--emphasized {
        color: ${euiTheme.colors.primaryText};
    }

    #panelTabs div[role = "tabpanel"], .gradientBg {
      background: ${transparentize(primaryBg, 0.5)};
      background: linear-gradient(-50deg, ${transparentize(
        primaryBg,
        0.89
    )} 0%, ${transparentize(accentBg, 0.89)} 90%),
      url("/images/noise.png");
      background-blend-mode: normal;
}



#imgEmbedContent, #imgEmbedContentLIGHT, #imgEmbedContentDARK, #latexContent {
    background-color: ${euiTheme.colors.emptyShade};
}


   .genericPanel divcode.euiCodeBlock__code {
    background-color: ${transparentize(t.colors.emptyShade, 0.9)};
}

#vg-tooltip-element.vg-tooltip {
    font-family: monospace;
    ${useEuiFontSize('xxs')}
    border: none;
    border-radius: ${t.border.radius.small};
}

#vg-tooltip-element.vg-tooltip table tr td {
      vertical-align: top;
}

#vg-tooltip-element.vg-tooltip table tr td.key {
      font-weight: 400;
      color: ${euiTheme.colors.primaryText};
}

#vg-tooltip-element.vg-tooltip table tr td.value {
      font-weight: 400;
      color: ${euiTheme.colors.text};
}

/* EUI tooltips are always dark: fix that for footnotes, adjusting the shadow to make it stand out more (doubling opacity) */
div.fn-tooltip-div {
        background-color: ${t.colors.emptyShade};
        color: ${t.colors.darkestShade};
        box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 5px 0px, rgba(0, 0, 0, 0.14) 0px 3.6px 13px 0px, rgba(0, 0, 0, 0.12) 0px 8.4px 23px 0px, rgba(0, 0, 0, 0.1) 0px 23px 35px 0px;
}

/* style the thing on the bottom of the tooltip to match the tooltip color */
div.fn-tooltip-div div.euiToolTip__arrow {
        background-color: ${t.colors.emptyShade};
}

`;

    return <Global styles={styles} />;
}
