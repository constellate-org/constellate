import { transparentize } from '@elastic/eui';
import { css } from '@emotion/react';

// prettier-ignore
export default function widgetPanelStyles(theme) {
    const { euiTheme } = theme;

    return {
        tabPanel: css`
height: 100%;
  `,
        embedContent: css`
height: 100%;
width: 100%;
background-color: ${euiTheme.colors.lightestShade};
border-radius: ${euiTheme.border.radius.medium};
box-shadow: 0 ${euiTheme.size.xs} ${euiTheme.size.xs} ${transparentize(euiTheme.colors.shadow, 0.04)};
`
    }
}
