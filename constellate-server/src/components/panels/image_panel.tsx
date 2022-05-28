import {
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTabbedContent,
} from '@elastic/eui';

import Image from 'next/image';

export default function ImagePanel(props) {
  const { url, code } = props;
  // const { euiTheme, colorMode } = useEuiTheme();
  const tabs = [
    {
      id: 'img',
      name: 'Plot',
      content: (
        <EuiFlexGroup
          justifyContent="center"
          direction="column"
          className="eui-fullHeight">
          <EuiFlexItem grow={false} className="eui-fullHeight">
            <div
              style={{ width: '100%', height: '100%', position: 'relative' }}>
              <Image src={url} layout="fill" alt="plot" objectFit="contain" />
            </div>
          </EuiFlexItem>
        </EuiFlexGroup>
      ),
    },
    {
      id: 'code',
      name: 'Code',
      className: 'eui-fullHeight',
      content: (
        <EuiCodeBlock
          language="python"
          lineNumbers
          overflowHeight="100%"
          fontSize="m"
          paddingSize="m"
          isCopyable={true}
          isVirtualized
          className="codeBlockEmbed">
          {code}
        </EuiCodeBlock>
      ),
    },
  ];

  return (
    <EuiTabbedContent
      tabs={tabs}
      initialSelectedTab={tabs[0]}
      className="eui-fullHeight"
      id="panelTabs"
      expand={true}
    />
  );
}
