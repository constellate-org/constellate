import { UseEuiTheme, withEuiTheme } from '@elastic/eui';
import { polyfill } from 'interweave-ssr';
import React from 'react';
import widgetPanelStyles from './widget_panel.styles';

polyfill();

type WidgetProps = {
  html: string;
  theme: UseEuiTheme;
};

class WidgetPanelInner extends React.Component<WidgetProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const styles = widgetPanelStyles(this.props.theme);
    return (
      <div
        id="widgetEmbedContent"
        css={styles.embedContent}
        dangerouslySetInnerHTML={{
          __html: this.props.html,
        }}
      />
    );
  }
}

export default withEuiTheme(WidgetPanelInner);
