import { transparentize } from '@elastic/eui';
import { css } from '@emotion/react';

// prettier-ignore
export default function plotlyPanelStyles(theme, mSize) {
    const { euiTheme, colorMode } = theme;
    const t = euiTheme;

    const darkColors = ['#3fa6da', '#43BF4d', '#f0b726', '#eb6847', '#bd6bbd', '#13c9ba', '#f5498b', '#b6d94c', '#af855a', '#9881f3'];
    const lightColors = ['#147eb3', '#29a634', '#d1980b', '#d33d17', '#9d3f9d', '#00a396', '#db2c6f', '#8eb125', '#946638', '#7961db'];

    const options = {
        paper_bgcolor: t.colors.emptyShade,
        plot_bgcolor: t.colors.lightestShade,
        font: {
            color: t.colors.text,
            family: t.font.family,
            size: mSize,
        },
        colorway: colorMode.toLocaleLowerCase() === 'dark' ? darkColors : lightColors,
        scene: {
            xaxis: {
                backgroundcolor: t.colors.lightestShade,
                color: t.colors.lightShade,
                gridcolor: t.colors.mediumShade,
            },
            yaxis: {
                backgroundcolor: t.colors.lightestShade,
                color: t.colors.lightShade,
                gridcolor: t.colors.mediumShade,
            },
            zaxis: {
                backgroundcolor: t.colors.lightestShade,
                color: t.colors.lightShade,
                gridcolor: t.colors.mediumShade,
            }
        }
    };

    return {
        plotlyLayout: options,
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
