import Head from 'next/head';
import Link from 'next/link';
import TextPanel from '../../components/markdown/text_panel';
import { Constellation, hasImgPanel } from '../../lib/constellate';
import PanelContent from '../../components/panels/panel_content';
import Shortcuts from '../../components/hotkeys';
import glob from 'glob';
import {
  EuiButton,
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
} from '@elastic/eui';
import { useRouter } from 'next/router';
import SideBar from '../../components/side_nav';
import ThemeSwitcher from '../../components/rho/theme_switcher';
import { useEffect, useState } from 'react';
import renderFootnoteBlock from '../../components/markdown/footnotes_collapse';

import themes from '../../../public/constellate_themes/themes';
import { readFileSync } from 'fs';
import path from 'path';

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
  const uuid = 'asdf';
  const shouldRenderImg = hasImgPanel(constellation.stars[starId]);
  const numIds = constellation.stars.length;

  const prevId = starId - 1 >= 0 ? starId - 1 : null;
  const nextId = starId + 1 < numIds ? starId + 1 : null;

  const imgTabContentFunc = EuiResizablePanel => {
    if (shouldRenderImg) {
      return (
        <EuiResizablePanel
          initialSize={50}
          paddingSize="none"
          color="plain"
          className="genericPanel">
          <PanelContent
            star={constellation.stars[starId]}
            uuid={uuid}
            slug={constellation.slug}
            panelUrl={process.env.PANEL_URL}
            isDark={colorMode === 'DARK'}
          />
        </EuiResizablePanel>
      );
    } else {
      return <></>;
    }
  };

  const collapsibleNav = (
    <EuiCollapsibleNav
      size={300}
      onClose={() => {
        setIsNavOpen(false);
      }}
      isOpen={isNavOpen}
      isDocked={isNavOpen}
      closeButtonPosition="inside"
      button={
        <EuiButtonIcon
          aria-labelledby="menu"
          iconType="menu"
          color="text"
          display={isNavOpen ? 'fill' : 'empty'}
          id="toggleMenu"
          onClick={() => setIsNavOpen(!isNavOpen)}>
          Open
        </EuiButtonIcon>
      }
      showButtonIfDocked
      ownFocus={false}
      className="collapseNavAnimate">
      {isNavOpen && (
        <EuiPanel>
          <EuiFlexGroup
            direction="column"
            justifyContent="spaceBetween"
            className="eui-fullHeight">
            <EuiFlexItem>
              <SideBar constellation={constellation} currId={starId}></SideBar>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiListGroup gutterSize="none">
                <EuiListGroupItem
                  size="xs"
                  wrapText
                  label={'© Nicholas Miklaucic 2022'}
                />
                <EuiListGroupItem
                  size="xs"
                  wrapText
                  href="https://github.com/nicholas-miklaucic/constellate"
                  label="Made Using Constellation"
                />
                <EuiListGroupItem
                  size="xs"
                  wrapText
                  href="#"
                  label="Static version"
                />
              </EuiListGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      )}
    </EuiCollapsibleNav>
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
            template="empty"
            fullHeight={true}
            restrictWidth={false}
            className="page-grow">
            <EuiHeader position="fixed">
              <EuiHeaderSection side="left">
                <EuiHeaderSectionItem>{collapsibleNav}</EuiHeaderSectionItem>
                <EuiHeaderSectionItem>
                  <EuiHeaderLogo iconType={theme['site_logo']}>
                    {theme['site_title']}
                  </EuiHeaderLogo>
                </EuiHeaderSectionItem>
              </EuiHeaderSection>
              <EuiHeaderSection side="left">
                <EuiHeaderSectionItem>
                  <h1 id="essay-title">{constellation.title}</h1>
                </EuiHeaderSectionItem>
              </EuiHeaderSection>
              <EuiHeaderSection side="right">
                <EuiHeaderSectionItem>
                  <ThemeSwitcher key="theme-switcher" />
                </EuiHeaderSectionItem>
                <EuiHeaderSectionItem>
                  <Shortcuts />
                </EuiHeaderSectionItem>
              </EuiHeaderSection>
            </EuiHeader>
            <EuiResizableContainer className="eui-fullHeight">
              {(EuiResizablePanel, EuiResizableButton) => (
                <>
                  <EuiResizablePanel
                    initialSize={shouldRenderImg ? 50 : 100}
                    scrollable={false}
                    grow={true}
                    paddingSize="none"
                    color="plain"
                    hasShadow
                    hasBorder>
                    <TextPanel content={constellation.stars[starId].markdown} />
                    {prevId !== null && (
                      <Link href={`/${constellation.slug}/${prevId}`} passHref>
                        <EuiButton
                          id="prevBtn"
                          rel="prev me"
                          color="text"
                          href={`/${constellation.slug}/${prevId}`}>
                          Last Page
                        </EuiButton>
                      </Link>
                    )}
                    {nextId !== null && (
                      <Link href={`/${constellation.slug}/${nextId}`} passHref>
                        <EuiButton
                          color="primary"
                          rel="next me"
                          fill={true}
                          href={`/${constellation.slug}/${nextId}`}
                          id="nextBtn">
                          Next Page
                        </EuiButton>
                      </Link>
                    )}
                  </EuiResizablePanel>

                  <EuiResizableButton />
                  {imgTabContentFunc(EuiResizablePanel)}
                </>
              )}
            </EuiResizableContainer>
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
    .sync(path.join(process.cwd(), 'public/constellations/*.constellate'))
    .forEach((fn: string) => {
      const data = JSON.parse(readFileSync(fn, 'utf8'));
      // @ts-ignore
      const constellation: Constellation = data;
      const slug = fn.split('/').reverse()[0].split('.')[0];
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
    .sync(path.join(process.cwd(), 'public/constellations/*.constellate'))
    .forEach((fn: string) => {
      const data = JSON.parse(readFileSync(fn, 'utf8'));
      // @ts-ignore
      const constellation: Constellation = data;
      const slug = fn.split('/').reverse()[0].split('.')[0];
      constellations[slug] = constellation;
    });

  return {
    props: {
      constellations: constellations,
    },
  };
}
