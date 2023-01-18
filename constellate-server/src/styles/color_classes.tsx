

const LIGHT_COLORS = [
    "#1846b3",
    "#355e00",
    "#bb8600",
    "#dd2800",
    "#c510d2",
    "#9470fe",
    "#007dc2",
    "#00aeb3",
    "#008a47",
    "#942e00",
    "#f3398e",
    "#9e0077",
]

const DARK_COLORS = [
    "#00a0ec",
    "#00bc70",
    "#deca00",
    "#ff7300",
    "#d83990",
    "#7555d3",
    "#8ac7ff",
    "#00f0ff",
    "#387200",
    "#aa2e00",
    "#ff7dc6",
    "#e960ff",
]

const COLOR_NAMES = [
    'blue',
    'green',
    'yellow',
    'red',
    'purple',
    'cerulean',
    'aqua',
    'emerald',
    'burgundy',
    'pink',
    'rose'
]

function color_css(colors: Array<String>) {
    return colors.map((code, i) => {
        return `.text-${COLOR_NAMES[i]}, .text-c${i + 1} {
            color: ${code};
        }`;
    }).join('\n');
}

export const dark_color_css = color_css(DARK_COLORS);
export const light_color_css = color_css(LIGHT_COLORS);
