import { transparentize, UseEuiTheme, useEuiFontSize } from "@elastic/eui";
import { css } from "@emotion/react";

// prettier-ignore
export default function indexStyles({ euiTheme, colorMode }) {
    return {
        grid: css`
padding-left: 10%;
padding-right: 10%;
`
    };
}
