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
    colors = dark_css;
  } else {
    primaryBg = tint(t.colors.primary, 0.5);
    accentBg = tint(t.colors.accent, 0.5);
    colors = light_css;
  }

  const styles = css`
        ${colors}

    ${panelThemes(t)}

    html {
      font-feature-settings: ${t.font.featureSettings};
    }

    kbd > kbd {
        border-radius: ${t.border.radius.small};
        background-color: ${t.colors.lightShade};
        color: ${t.colors.fullShade};
        border-width: 0px !important;
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



#imgEmbedContent, #latexContent {
    background-color: ${euiTheme.colors.emptyShade};
}


   .genericPanel divcode.euiCodeBlock__code {
    background-color: ${transparentize(t.colors.emptyShade, 0.9)};
}

`;

  return <Global styles={styles} />;
}
