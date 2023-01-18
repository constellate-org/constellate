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
  EuiCode,
  getDefaultEuiMarkdownParsingPlugins,
  getDefaultEuiMarkdownProcessingPlugins,
} from "@elastic/eui";
import remarkFootnotes from "remark-footnotes";
import remarkSmartypants from "remark-smartypants";
import remarkNumberedFootnoteLabels from "remark-numbered-footnote-labels";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { React, useEffect } from "react";
import renderFootnoteBlock from "./footnotes_collapse";

import { KatexRenderer, MathMarkdownParser } from "./math";

function DebugParser() {
  const Parser = this.Parser;
  const tokenizers = Parser.prototype.blockTokenizers;
  const methods = Parser.prototype.blockMethods;

  function tokenizeTest(eat, value, silent) {
    console.log("test value", value);

    return eat(``)({
      test: "debug",
    });
  }
  tokenizers.debug = tokenizeTest;
  methods.splice(methods.indexOf("text"), 0, "debug");
}

const parsingList = getDefaultEuiMarkdownParsingPlugins();

// remove remark-breaks: this matches standard Markdown syntax
parsingList.splice(3, 1);

// parsingList.splice(1, 0, [remarkGfm, {}]);
parsingList.push([MathMarkdownParser, { singleDollar: true }]);
parsingList.push([remarkFootnotes, {}]);
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

// replace EuiCode with transparent wrapper that looks less ugly
function customCode(props) {
  return <EuiCode {...props} />;
}
processingList[1][1].components.kbd = doubleKbd;

// this lets users put raw HTML in
processingList.splice(1, 0, [rehypeRaw]);

// console.log(parsingList);
// @ts-ignore
// processingList.splice(2, 0, [rehypeStringify, { allowDangerousHtml: true }]);
// @ts-ignore
// console.log(processingList);

export default function TextPanel(props) {
  useEffect(renderFootnoteBlock);
  return (
    <EuiPanel
      hasShadow={false}
      hasBorder={false}
      className="eui-fullHeight"
      grow={true}
      paddingSize="m"
    >
      <EuiFlexGroup
        direction="column"
        justifyContent="center"
        className="eui-fullHeight eui-yScroll"
      >
        <EuiFlexItem
          grow
          className="eui-fullHeight"
          style={{ padding: "1rem" }}
        >
          <div className="eui-yScroll">
            <EuiMarkdownFormat
              parsingPluginList={parsingList}
              processingPluginList={processingList}
              id="textContent"
              grow
            >
              {props.content}
            </EuiMarkdownFormat>
          </div>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}
