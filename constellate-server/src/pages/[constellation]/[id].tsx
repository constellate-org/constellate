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
  EuiListGroup,
  EuiListGroupItem,
  EuiPageTemplate,
  EuiPanel,
  EuiResizableContainer,
  useEuiTheme,
  useIsWithinBreakpoints,
} from "@elastic/eui";
import { useRouter } from "next/router";
import SideBar from "../../components/side_nav";
import ThemeSwitcher from "../../components/rho/theme_switcher";
import { useEffect, useState } from "react";
import renderFootnoteBlock from "../../components/markdown/footnotes_collapse";

import themes from "../../../public/constellate_themes/themes";
import { readFileSync } from "fs";
import path from "path";
import { EuiResizablePanel } from "@elastic/eui/src/components/resizable_container/resizable_panel";
import { EuiResizableButton } from "@elastic/eui/src/components/resizable_container/resizable_button";

const theme = themes[process.env.CONSTELLATE_THEME];

function StarPage({ constellations }) {
  useEffect(renderFootnoteBlock);
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

  const isMobile = useIsWithinBreakpoints(["xs", "s"]);

  const prevButton = (
    <Link href={`/${constellation.slug}/${prevId}`} passHref>
      <EuiButton
        size="s"
        id="prevBtn"
        rel="prev me"
        color="text"
        href={`/${constellation.slug}/${prevId}`}
        isDisabled={prevId === null}
      >
        Last Page
      </EuiButton>
    </Link>
  );
  const nextButton = (
    <Link href={`/${constellation.slug}/${nextId}`} passHref>
      <EuiButton
        size="s"
        color="primary"
        fill
        rel="next me"
        href={`/${constellation.slug}/${nextId}`}
        id="nextBtn"
        isDisabled={nextId === null}
      >
        Next Page
      </EuiButton>
    </Link>
  );

  const imgTabContentFunc = (EuiResizablePanel, EuiResizableButton) => {
    if (shouldRenderImg) {
      return (
        <>
          <EuiResizableButton />
          <EuiResizablePanel
            initialSize={50}
            paddingSize="none"
            color="plain"
            className="genericPanel"
          >
            <PanelContent
              star={constellation.stars[starId]}
              uuid={uuid}
              slug={constellation.slug}
              panelUrl={process.env.PANEL_URL}
              isDark={colorMode === "DARK"}
            />
          </EuiResizablePanel>
        </>
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
              iconType={theme["site_logo"]}
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
              rightSideGroupProps={{ style: { alignItems: "center" } }}
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
                        label={"© Nicholas Miklaucic 2022"}
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
                className="eui-fullHeight"
                direction={isMobile ? "vertical" : "horizontal"}
              >
                {(EuiResizablePanel, EuiResizableButton) => (
                  <>
                    <EuiResizablePanel
                      initialSize={shouldRenderImg ? 50 : 100}
                      scrollable={false}
                      grow={true}
                      paddingSize="none"
                      color="plain"
                      hasShadow
                      hasBorder
                    >
                      <TextPanel
                        content={constellation.stars[starId].markdown}
                      />
                    </EuiResizablePanel>
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
