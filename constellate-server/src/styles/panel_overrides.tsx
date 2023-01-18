import { EuiThemeComputed, shade, transparentize } from "@elastic/eui";

export default function panelThemes(t: EuiThemeComputed) {
    return (
        <style>
            {`
    .bk-root .noUi-target {
        box-shadow: none;
        border: 2px solid ${t.colors.lightestShade};
    }
        .bk-root .noUi-horizontal .noUi-handle {
            /* handle */
            width: 1rem;
        height: 1.2rem;
        right: -0.5rem;
        top: -0.6rem;
    }
        .bk-root .noUi-connects,
        .bk-root .noUi-connect {
            /* background */
            border: none;
        box-shadow: none;
        background-color: ${t.colors.lightShade} !important;
    }
        // slider height
        .bk-root .noUi-horizontal {
            height: 0.3rem;
    }
        .bk-root .noUi-handle {
            border: none;
        /* handle color */
        background: ${t.colors.primaryText};
        border-radius: 4px;
        box-shadow: none;
    }
              `}
        </style>
    )
}
