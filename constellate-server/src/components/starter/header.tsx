import Image from "next/legacy/image";
import Link from 'next/link';
import {
  EuiHeader,
  EuiTitle,
  EuiHeaderSectionItemButton,
  useEuiTheme,
  EuiToolTip,
  EuiIcon,
} from '@elastic/eui';
import { imageLoader } from '../../lib/loader';
import ThemeSwitcher from './theme_switcher';
import { headerStyles } from './header.styles';

const Header = () => {
  const { euiTheme } = useEuiTheme();
  const href = 'https://github.com/elastic/next-eui-starter';
  const label = 'EUI GitHub repo';
  const styles = headerStyles(euiTheme);

  return (
    <EuiHeader
      position="fixed"
      sections={[
        {
          items: [
            <Link key="logo" href="/" passHref css={styles.logo}>

              <Image
                width={24}
                height={24}
                src="/pollardsrho.svg"
                alt="rho logo"
                loader={imageLoader}
              />
              <EuiTitle size="xxs">
                <span>Next.js EUI Starter</span>
              </EuiTitle>

            </Link>,
          ],
          borders: 'none',
        },
        {
          items: [
            <ThemeSwitcher key="theme-switcher" />,
            <EuiToolTip content="Github" key="github">
              <EuiHeaderSectionItemButton aria-label={label} href={href}>
                <EuiIcon type="logoGithub" aria-hidden="true" />
              </EuiHeaderSectionItemButton>
            </EuiToolTip>,
          ],
          borders: 'none',
        },
      ]}
    />
  );
};

export default Header;
