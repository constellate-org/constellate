import {
  EuiCard,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHeader,
  EuiHeaderLogo,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiImage,
  EuiPageTemplate,
  EuiPanel,
  EuiText,
  useEuiTheme,
} from '@elastic/eui';
import Image from 'next/image';
import themes from '../../public/constellate_themes/themes';
import { Constellation } from '../lib/constellate';
import glob from 'glob';
import path from 'path';
import { readFileSync } from 'fs';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ThemeSwitcher from '../components/rho/theme_switcher';
import Shortcuts from '../components/hotkeys';
import indexStyles from '../styles/index.styles';
const theme = themes[process.env.CONSTELLATE_THEME];

function findImage(constellation: Constellation, colorMode: string, styles) {
  let url = '';
  const hasNoImg = constellation.stars.every(star => {
    switch (star.kind) {
      case 'markdown_matplotlib': {
        if (colorMode.toLocaleLowerCase() === 'light') {
          url = star.light;
        } else {
          url = star.dark;
        }
        return false; // break out of the loop
      }
      default: {
        // no other panels have static images for now
        return true;
      }
    }
  });

  if (hasNoImg) {
    // default: return gradient
    return (
      <EuiImage
        size="fullWidth"
        url="https://www.nasa.gov/sites/default/files/thumbnails/image/crab-nebula-mosaic.jpg"
        alt="Crab nebula"
      />
    );
  } else {
    return (
      <Image
        css={styles.cardImg}
        src={url}
        alt={constellation.title}
        width="100%"
        height="100%"
        layout="responsive"
        objectFit="cover"
      />
    );
  }
}

function ConstellationCard({ constellation, styles }) {
  const { euiTheme, colorMode } = useEuiTheme();
  return (
    <EuiCard
      textAlign="left"
      image={findImage(constellation, colorMode, styles)}
      title={constellation.title}
      description=""
      href={`${constellation.slug}/0`}
      css={styles.cardCard}
    />
  );
}

function IndexPage({ constellations }) {
  const router = useRouter();
  const { euiTheme, colorMode } = useEuiTheme();
  if (router.isFallback) {
    return <h1>Loading...</h1>;
  }

  const styles = indexStyles({ euiTheme, colorMode });

  return (
    <>
      <Head>
        <title>{theme.site_title}</title>
      </Head>

      <EuiPageTemplate
        paddingSize="none"
        template="empty"
        fullHeight={true}
        restrictWidth={false}
        className="page-grow">
        <EuiHeader position="fixed">
          <EuiHeaderSection side="left">
            <EuiHeaderSectionItem>
              <EuiHeaderLogo iconType={theme['site_logo']}>
                {theme['site_title']}
              </EuiHeaderLogo>
            </EuiHeaderSectionItem>
          </EuiHeaderSection>
          <EuiHeaderSection side="right">
            <EuiHeaderSectionItem>
              <ThemeSwitcher key="theme-switcher" />
            </EuiHeaderSectionItem>
          </EuiHeaderSection>
        </EuiHeader>
        <EuiFlexGrid columns={4} css={styles.grid}>
          {Object.entries(constellations).map(([slug, constellation]) => {
            return (
              <EuiFlexItem key={slug}>
                <ConstellationCard
                  constellation={constellation}
                  styles={styles}
                />
              </EuiFlexItem>
            );
          })}
        </EuiFlexGrid>
      </EuiPageTemplate>
    </>
  );
}

export async function getStaticProps() {
  /* const res = await fetch(
   *   'file:///home/nicholas/programs/constellations/metropolis-hastings/mcmc.constellate.json'
   * );
   * const constellation: Constellation = await res.json();  */

  const constellations = {};
  glob
    .sync(path.join(process.cwd(), 'public/constellations/*.constellate.json'))
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

export default IndexPage;
