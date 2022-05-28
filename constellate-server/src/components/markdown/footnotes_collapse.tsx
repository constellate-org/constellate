import ReactDOM from 'react-dom';
import React, { useState } from 'react';
import {
  EuiAccordion,
  EuiToolTip,
  htmlIdGenerator,
  useGeneratedHtmlId,
} from '@elastic/eui';

function FootnotesCollapse(props) {
  const [isOpen, setIsOpen] = useState(props.isOpen);
  const accordionId = htmlIdGenerator()();
  document
    .querySelectorAll('a.footnote-ref-processed')
    .forEach(function addLink(el) {
      el.classList.toggle('footnote-ref-processed');
      el.classList.toggle('footnote-ref-tooltip');
      (el as HTMLAnchorElement).onclick = function () {
        setIsOpen(true);
        setTimeout(
          () =>
            document
              .getElementById((el as HTMLAnchorElement).href.split('#')[1])
              .scrollIntoView(false),
          300
        );
      };
    });
  return (
    <div>
      <EuiAccordion
        id={accordionId}
        buttonContent="Footnotes"
        forceState={isOpen ? 'open' : 'closed'}
        onToggle={() => setIsOpen(!isOpen)}>
        {props.inner}
      </EuiAccordion>
    </div>
  );
}

export default function renderFootnoteBlock() {
  // augment footnote links with tooltips
  document
    .querySelectorAll('a.footnote-ref')
    .forEach(function repl(el: Element) {
      el.classList.toggle('footnote-ref');
      el.classList.toggle('footnote-ref-processed');
      const temp = document.createElement('span');
      temp.classList.toggle('fn-tooltip');
      const fnId = (el as HTMLLinkElement).href.split('#').reverse()[0];
      const fnElement = document.getElementById(fnId);
      const fnContent = fnElement != null ? fnElement.innerHTML : '';
      // footnotes are numbered by the order of definitions, which is incorrect: switch to order used by footnotes block
      const fnNum =
        fnElement != null
          ? Array.from(fnElement.parentElement.children).indexOf(fnElement) + 1
          : 0;
      const content = (
        <span className="fn-tooltip-content">
          <p dangerouslySetInnerHTML={{ __html: fnContent }} />
        </span>
      );

      el.innerHTML = `${fnNum}`;
      const elHtml = <div dangerouslySetInnerHTML={{ __html: el.outerHTML }} />;
      ReactDOM.render(
        <span>
          <EuiToolTip content={content}>{elHtml}</EuiToolTip>
        </span>,
        temp,
        () => {
          console.log('Wrapping footnote reference...\n', temp);
          el.replaceWith(temp);
        }
      );
    });
  // render footnotes using collapse
  document
    .querySelectorAll('div.footnotes')
    .forEach(function repl(el: Element) {
      console.log('Wrapping footnotes...');
      el.classList.remove('footnotes');
      el.classList.add('footnotes-processed');
      const content = (
        <div
          dangerouslySetInnerHTML={{
            __html: el.innerHTML,
          }}
        />
      );
      el.innerHTML = '';
      ReactDOM.render(<FootnotesCollapse inner={content} isOpen={false} />, el);
    });
}
