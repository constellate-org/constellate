import { ReactElement } from 'react';
import Document, { Head, Html, Main, NextScript } from 'next/document';
import { defaultTheme, Theme, themeConfig } from '../lib/theme';
import themes from '../../public/constellate_themes/themes';

const theme = themes[process.env.CONSTELLATE_THEME];

const pathPrefix = process.env.PATH_PREFIX;

function themeLink(theme: Theme): ReactElement {
    let disabledProps = {};

    if (theme.id !== defaultTheme) {
        disabledProps = {
            disabled: true,
            'aria-disabled': true,
        };
    }

    return (
        <link
            rel="stylesheet"
            href={`${pathPrefix}/${theme.publicPath}`}
            data-name="eui-theme"
            data-theme-name={theme.name}
            data-theme={theme.id}
            key={theme.id}
            {...disabledProps}
        />
    );
}

/**
 * A custom `Document` is commonly used to augment your application's
 * `<html>` and `<body>` tags. This is necessary because Next.js pages skip
 * the definition of the surrounding document's markup.
 *
 * In this case, we customize the default `Document` implementation to
 * inject the available EUI theme files.  Only the `light` theme is
 * initially enabled.
 *
 * @see https://nextjs.org/docs/advanced-features/custom-document
 */
export default class MyDocument extends Document {
    render(): ReactElement {
        const isLocalDev = process.env.NODE_ENV === 'development';

        const favicon16Prod = `${pathPrefix}/images/favicon/prod/favicon-16x16.png`;
        const favicon32Prod = `${pathPrefix}/images/favicon/prod/favicon-32x32.png`;
        const favicon96Prod = `${pathPrefix}/images/favicon/prod/favicon-96x96.png`;
        const favicon16Dev = `${pathPrefix}/images/favicon/dev/favicon-16x16.png`;
        const favicon32Dev = `${pathPrefix}/images/favicon/dev/favicon-32x32.png`;
        const favicon96Dev = `${pathPrefix}/images/favicon/dev/favicon-96x96.png`;

        return (
            <Html lang="en">
                <Head>
                    <meta name="description" content="Constellate" />
                    <meta property="og:title" content={theme['title']} />
                    <meta property="og:description" content="Constellate" />
                    <meta
                        property="og:image"
                        content="https://repository-images.githubusercontent.com/233832487/cddf0ff5-a35f-4380-8912-1c9f365366a8"
                    />
                    <meta name="eui-styles-global" />

                    {themeConfig.availableThemes.map(each => themeLink(each))}
                    {theme.head}

                    <link
                        rel="icon"
                        type="image/png"
                        href={isLocalDev ? favicon16Dev : favicon16Prod}
                        sizes="16x16"
                    />
                    <link
                        rel="icon"
                        type="image/png"
                        href={isLocalDev ? favicon32Dev : favicon32Prod}
                        sizes="32x32"
                    />
                    <link
                        rel="icon"
                        type="image/png"
                        href={isLocalDev ? favicon96Dev : favicon96Prod}
                        sizes="96x96"
                    />
                </Head>
                <body className="guideBody">
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
