// @ts-nocheck

/* import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon';
 *
 * import { icon as cv } from '@elastic/eui/es/components/icon/assets/controls_vertical';
 * import { icon as cc } from '@elastic/eui/es/components/icon/assets/copy_clipboard';
 * import { icon as eyec } from '@elastic/eui/es/components/icon/assets/eye_closed';
 * import { icon as eyeo } from '@elastic/eui/es/components/icon/assets/eye';
 * import { icon as bold } from '@elastic/eui/es/components/icon/assets/editor_bold';
 * import { icon as ital } from '@elastic/eui/es/components/icon/assets/editor_italic';
 * import { icon as under } from '@elastic/eui/es/components/icon/assets/editor_underline';
 * import { icon as ul } from '@elastic/eui/es/components/icon/assets/editor_unordered_list';
 * import { icon as ol } from '@elastic/eui/es/components/icon/assets/editor_ordered_list';
 * import { icon as quote } from '@elastic/eui/es/components/icon/assets/quote';
 * import { icon as cb } from '@elastic/eui/es/components/icon/assets/editor_code_block';
 * import { icon as link } from '@elastic/eui/es/components/icon/assets/editor_link';
 * import { icon as comment } from '@elastic/eui/es/components/icon/assets/editor_comment';
 * import { icon as cross } from '@elastic/eui/es/components/icon/assets/crossInACircleFilled'; */

import {
  EuiMarkdownFormat,
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  getDefaultEuiMarkdownParsingPlugins,
  getDefaultEuiMarkdownProcessingPlugins,
} from '@elastic/eui';
import remarkFootnotes from 'remark-footnotes';
import remarkSmartypants from 'remark-smartypants';
import remarkNumberedFootnoteLabels from 'remark-numbered-footnote-labels';
import rehypeRaw from 'rehype-raw';
import React from 'react';

import { KatexRenderer, MathMarkdownParser } from './math';

const parsingList = getDefaultEuiMarkdownParsingPlugins();

// remove remark-breaks: this matches standard Markdown syntax
parsingList.splice(3, 1);

parsingList.push([MathMarkdownParser, { singleDollar: true }]);
parsingList.push([remarkFootnotes, {}]);
parsingList.push([remarkSmartypants, {}]);
parsingList.push([remarkNumberedFootnoteLabels, {}]);
// console.debug('parsingList 2', parsingList);
const processingList = getDefaultEuiMarkdownProcessingPlugins();

processingList[1][1].components.checkboxplugin =
  processingList[1][1].components.checkboxPlugin;
processingList[1][1].components.mathplugin = KatexRenderer;

// replace <kbd> with <kbd><kbd>
function doubleKbd(props) {
  return (
    <kbd>
      <kbd {...props}></kbd>
    </kbd>
  );
}
processingList[1][1].components.kbd = doubleKbd;

processingList.splice(processingList.length - 1, 0, [rehypeRaw]);
// @ts-ignore
// processingList.splice(2, 0, [rehypeStringify, { allowDangerousHtml: true }]);
// @ts-ignore
// console.debug('processingList 2', processingList);
// console.debug('comps', processingList.reverse()[0][1].components);

export default function TextPanel(props) {
  return (
    <EuiPanel
      hasShadow={false}
      hasBorder={false}
      className="eui-fullHeight"
      grow={true}
      paddingSize="m">
      <EuiFlexGroup
        direction="column"
        justifyContent="center"
        className="eui-fullHeight eui-yScroll">
        <EuiFlexItem
          grow
          className="eui-fullHeight"
          style={{ padding: '1rem' }}>
          <div className="eui-yScroll">
            <EuiMarkdownFormat
              parsingPluginList={parsingList}
              processingPluginList={processingList}
              id="textContent"
              grow>
              {props.content}
            </EuiMarkdownFormat>
          </div>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}
