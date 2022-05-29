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
    primaryBg = transparentize(t.colors.primary, 0.6);
    accentBg = transparentize(t.colors.accent, 0.6);
    colors = dark_css;
  } else {
    primaryBg = transparentize(t.colors.primary, 0.6);
    accentBg = transparentize(t.colors.accent, 0.6);
    colors = light_css;
  }

  const styles = css`
        ${colors}

    ${panelThemes(t)}

    html {
      font-feature-settings: ${t.font.featureSettings};
    }

    kbd>kbd {
        border-radius: ${t.border.radius.small};
        padding: 0.2rem;
        background-color: ${t.colors.lightestShade};
        color: ${t.colors.fullShade}
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
        #nextBtn {
        background-color: ${t.colors.primary};
    }
        .no-invert-bg.euiControlBar {
        background-color: ${t.colors.body};
        box-shadow: none;
        color: ${t.colors.text};
    }

        .no-invert-bg.euiControlBar.euiControlBar__text {
        color: ${t.colors.subdued};
    }

        .no-invert-bg.euiControlBar.euiControlBar__breadcrumbs.euiBreadcrumb::after {
        background-color: ${t.colors.subdued};
    }

        .no-invert-bg.euiControlBar euiControlBar__breadcrumbs.euiBreadcrumb: not(.euiBreadcrumb--last).euiBreadcrumb__content,
        .no-invert-bg.euiControlBar.euiControlBar__breadcrumbs.euiBreadcrumb: not(.euiBreadcrumb--last).euiBreadcrumb__content {
        color: ${t.colors.subdued};
    }


        .sunmoon-grp label.euiButtonGroupButton-isSelected {
        color: ${t.colors.disabledText};
    }

        .euiSideNavItem.euiSideNavItem--trunk {
        color: ${euiTheme.colors.subdued};
    }

        .currItem.euiSideNavItem--emphasized {
        color: ${euiTheme.colors.primaryText};
    }

        .euiPageHeaderContent__top.euiFlexGroup--gutterLarge {
        background-color: ${primaryBg};
        color: ${euiTheme.colors.ghost};
        margin: 0px;
    }

        .euiPageHeaderContent__top.euiFlexGroup--gutterLarge h1 {
        color: inherit;
    }

        .euiPageHeaderContent__top.euiFlexGroup--gutterLarge.euiIcon {
        fill: ${euiTheme.colors.ghost};
    }

    #panelTabs div[role = "tabpanel"], .gradientBg {
        background: ${primaryBg};
        background: linear-gradient(90deg, ${primaryBg} 0%, ${accentBg} 100%);
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
