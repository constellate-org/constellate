// @ts-nocheck

import {
  EuiCodeBlock,
  EuiTabbedContent,
  useEuiFontSize,
  useEuiTheme,
} from '@elastic/eui';
import dynamic from 'next/dynamic';
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });
import plotlyPanelStyles from './plotly_panel.styles';
import { merge } from 'lodash';
import Script from 'next/script';

export default function PlotlyPanel(props) {
  const { fig, code } = props;
  const { data, layout } = fig;

  const styles = plotlyPanelStyles(useEuiTheme(), useEuiFontSize('m', 'px'));

  // remove plotly logo
  const config = { displaylogo: false };

  const tabs = [
    {
      id: 'img',
      name: 'Plot',
      content: (
        <>
          {
            // @ts-ignore
            <Plot
              data={data}
              layout={merge(layout, styles.plotlyLayout)}
              config={config}
            />
          }
        </>
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
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-AMS-MML_SVG" />
      <EuiTabbedContent
        tabs={tabs}
        initialSelectedTab={tabs[0]}
        className="eui-fullHeight"
        id="panelTabs"
        expand={true}
      />
    </>
  );
}
