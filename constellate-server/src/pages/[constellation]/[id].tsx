import Head from "next/head";
import Link from "next/link";
import TextPanel from "../../components/markdown/text_panel";
import { Constellation, hasImgPanel } from "../../lib/constellate";
import PanelContent from "../../components/panels/panel_content";
import Shortcuts from "../../components/hotkeys";
import glob from "glob";
import {
    EuiButton,
    EuiButtonEmpty,
    EuiButtonIcon,
    EuiCollapsibleNav,
    EuiFlexGroup,
    EuiFlexItem,
    EuiHeader,
    EuiHeaderLogo,
    EuiHeaderSection,
    EuiHeaderSectionItem,
    EuiHideFor,
    EuiListGroup,
    EuiListGroupItem,
    EuiPageTemplate,
    EuiPanel,
    EuiResizableContainer,
    EuiShowFor,
    useEuiTheme,
    useIsWithinBreakpoints,
    EuiResizablePanel,
    EuiResizableButton,
} from "@elastic/eui";
import { useRouter } from "next/router";
import SideBar from "../../components/side_nav";
import ThemeSwitcher from "../../components/rho/theme_switcher";
import { useEffect, useState } from "react";
import renderFootnoteBlock from "../../components/markdown/footnotes_collapse";

import themes from "../../../public/constellate_themes/themes";
import { readFileSync } from "fs";
import path from "path";
import Image from "next/image";
import React from "react";
import {
    NextEuiButton,
    NextEuiButtonIcon,
} from "../../components/next_eui/button";

const theme = themes[process.env.CONSTELLATE_THEME];

function StarPage({ constellations }) {
    const router = useRouter();
    const { colorMode } = useEuiTheme();
    const [isNavOpen, setIsNavOpen] = useState(false);

    if (router.isFallback) {
        return <h1>Loading...</h1>;
    }

    const { id } = router.query;
    const constellation = constellations[router.query.constellation as string];
    const starId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id);
    const uuid = "asdf";
    const shouldRenderImg = hasImgPanel(constellation.stars[starId]);
    const numIds = constellation.stars.length;

    const prevId = starId - 1 >= 0 ? starId - 1 : null;
    const nextId = starId + 1 < numIds ? starId + 1 : null;

    const mobileSizes: ("xs" | "s" | "m" | "l" | "xl")[] = ["xs", "s"];
    const showMobile = "eui-showFor--xs eui-showFor--s";
    const hideMobile = "eui-hideFor--xs eui-hideFor--s";

    const prevButton = (
        <>
            <Link href={`/${constellation.slug}/${prevId}`} passHref legacyBehavior>
                <NextEuiButtonIcon
                    size="xs"
                    id="prevBtn"
                    rel="prev me"
                    color="text"
                    display="fill"
                    iconType="arrowLeft"
                    aria-label="Last Page"
                    href={`/${constellation.slug}/${prevId}`}
                    isDisabled={prevId === null}
                    className={showMobile}
                />
            </Link>
            <Link href={`/${constellation.slug}/${prevId}`} passHref legacyBehavior>
                <NextEuiButton
                    size="s"
                    id="prevBtn"
                    rel="prev me"
                    color="text"
                    iconType="arrowLeft"
                    href={`/${constellation.slug}/${prevId}`}
                    isDisabled={prevId === null}
                    className={hideMobile}
                >
                    Last Page
                </NextEuiButton>
            </Link>
        </>
    );
    const nextButton = (
        <>
            <Link href={`/${constellation.slug}/${nextId}`} passHref legacyBehavior>
                <NextEuiButtonIcon
                    size="xs"
                    color="primary"
                    rel="next me"
                    iconType="arrowRight"
                    display="fill"
                    href={`/${constellation.slug}/${nextId}`}
                    id="nextBtn"
                    aria-label="Next Page"
                    isDisabled={nextId === null}
                    className={showMobile}
                />
            </Link>
            <Link href={`/${constellation.slug}/${nextId}`} passHref legacyBehavior>
                <NextEuiButton
                    size="s"
                    color="primary"
                    fill
                    rel="next me"
                    iconType="arrowRight"
                    href={`/${constellation.slug}/${nextId}`}
                    id="nextBtn"
                    isDisabled={nextId === null}
                    className={hideMobile}
                >
                    Next Page
                </NextEuiButton>
            </Link>
        </>
    );

    const imgTabContentFunc = (EuiResizablePanel, EuiResizableButton) => {
        if (shouldRenderImg) {
            return (
                <EuiResizablePanel
                    initialSize={50}
                    paddingSize="none"
                    color="plain"
                    id="panelContentContr"
                    className="genericPanel"
                    minSize="50px"
                >
                    <PanelContent
                        star={constellation.stars[starId]}
                        uuid={uuid}
                        slug={constellation.slug}
                        panelUrl={process.env.PANEL_URL}
                        isDark={colorMode === "DARK"}
                    />
                </EuiResizablePanel>
            );
        } else {
            return <></>;
        }
    };

    const navButton = (
        <EuiButtonIcon
            aria-labelledby="menu"
            iconType="menu"
            color="text"
            display={isNavOpen ? "fill" : "base"}
            size="s"
            id="toggleMenu"
            onClick={() => setIsNavOpen(!isNavOpen)}
        >
            Open
        </EuiButtonIcon>
    );

    return (
        <>
            {constellation && (
                <>
                    <Head>
                        <title>{constellation.title}</title>
                    </Head>

                    <EuiPageTemplate
                        paddingSize="none"
                        restrictWidth={false}
                        direction="row"
                        panelled={false}
                    >
                        <EuiPageTemplate.Header
                            iconType={() => (
                                <Image
                                    src={theme["site_logo"]}
                                    width={32}
                                    height={32}
                                    alt="Logo"
                                />
                            )}
                            bottomBorder={false}
                            paddingSize="m"
                            pageTitle={constellation.title}
                            pageTitleProps={{
                                id: "essay-title",
                            }}
                            rightSideItems={[
                                navButton,
                                <Shortcuts />,
                                <ThemeSwitcher key="theme-switcher" />,
                                nextButton,
                                prevButton,
                            ]}
                            responsive={false}
                            rightSideGroupProps={{ style: { alignItems: "left" } }}
                            id="pageHeader"
                        ></EuiPageTemplate.Header>
                        {isNavOpen && (
                            <EuiPageTemplate.Sidebar paddingSize="xl" sticky>
                                <EuiFlexGroup
                                    direction="column"
                                    justifyContent="spaceBetween"
                                    className="eui-fullHeight"
                                >
                                    <EuiFlexItem>
                                        <SideBar
                                            constellation={constellation}
                                            currId={starId}
                                        ></SideBar>
                                    </EuiFlexItem>
                                    <EuiFlexItem grow={false}>
                                        <EuiListGroup gutterSize="none">
                                            <EuiListGroupItem
                                                size="xs"
                                                wrapText
                                                label={"© Nicholas Miklaucic 2023"}
                                            />
                                            <EuiListGroupItem
                                                size="xs"
                                                wrapText
                                                href="https://github.com/nicholas-miklaucic/constellate"
                                                label="Made Using Constellation"
                                            />
                                        </EuiListGroup>
                                    </EuiFlexItem>
                                </EuiFlexGroup>
                            </EuiPageTemplate.Sidebar>
                        )}
                        <EuiPageTemplate.Section
                            id="mainSection"
                            contentProps={{ style: { height: "100%" } }}
                        >
                            <EuiResizableContainer
                                className={"eui-fullHeight " + showMobile}
                                direction="vertical"
                            >
                                {(EuiResizablePanel, EuiResizableButton) => (
                                    <>
                                        <EuiResizablePanel
                                            initialSize={shouldRenderImg ? 50 : 100}
                                            minSize="20px"
                                            scrollable={false}
                                            grow={true}
                                            id="textPanelContr"
                                            paddingSize="none"
                                            color="plain"
                                            hasShadow
                                            hasBorder
                                        >
                                            <TextPanel
                                                content={constellation.stars[starId].markdown}
                                            />
                                        </EuiResizablePanel>
                                        {/* for some reason this doesn't work */}
                                        {/* <EuiResizableButton id="vertResizeButton" /> */}
                                        {imgTabContentFunc(EuiResizablePanel, EuiResizableButton)}
                                    </>
                                )}
                            </EuiResizableContainer>
                            <EuiResizableContainer
                                className={"eui-fullHeight " + hideMobile}
                                direction="horizontal"
                            >
                                {(EuiResizablePanel, EuiResizableButton) => (
                                    <>
                                        <EuiResizablePanel
                                            initialSize={shouldRenderImg ? 50 : 100}
                                            minSize="20px"
                                            scrollable={false}
                                            grow={true}
                                            id="textPanelContr"
                                            paddingSize="none"
                                            color="plain"
                                            hasShadow
                                            hasBorder
                                        >
                                            <TextPanel
                                                content={constellation.stars[starId].markdown}
                                            />
                                        </EuiResizablePanel>
                                        <EuiResizableButton
                                            id="horizResizeButton"
                                            isHorizontal={true}
                                        />
                                        {imgTabContentFunc(EuiResizablePanel, EuiResizableButton)}
                                    </>
                                )}
                            </EuiResizableContainer>
                        </EuiPageTemplate.Section>
                    </EuiPageTemplate>
                </>
            )}
        </>
    );
}

export default StarPage;

export async function getStaticPaths() {
    const paths = [];
    glob
        .sync(path.join(process.cwd(), "public/constellations/*.constellate"))
        .forEach((fn: string) => {
            const data = JSON.parse(readFileSync(fn, "utf8"));
            // @ts-ignore
            const constellation: Constellation = data;
            const slug = fn.split("/").reverse()[0].split(".")[0];
            constellation.stars.forEach((s, i) => {
                paths.push({
                    params: {
                        constellation: slug,
                        id: i.toString(),
                    },
                });
            });
        });

    // we need to return 404s for bad paths, because otherwise RequireJS will think our fallback page is a JS file and try to load it instead of using the CDN
    return {
        paths: paths,
        fallback: false,
    };
}

export async function getStaticProps() {
    /* const res = await fetch(
     *   'file:///home/nicholas/programs/constellations/metropolis-hastings/mcmc.constellate.json'
     * );
     * const constellation: Constellation = await res.json();  */

    const constellations = {};
    glob
        .sync(path.join(process.cwd(), "public/constellations/*.constellate"))
        .forEach((fn: string) => {
            const data = JSON.parse(readFileSync(fn, "utf8"));
            // @ts-ignore
            const constellation: Constellation = data;
            const slug = fn.split("/").reverse()[0].split(".")[0];
            constellations[slug] = constellation;
        });

    return {
        props: {
            constellations: constellations,
        },
    };
}
