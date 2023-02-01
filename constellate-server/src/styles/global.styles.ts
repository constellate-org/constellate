import { useEuiBreakpoint } from "@elastic/eui";
import { css } from "@emotion/react";

/*
Most of these styles really shouldn't be here, and in an ideal world, once Emotion
replaces SASS completely, these won't be necessary. For now, this is the only way
to override some parts of the default theme without making a whole new one.
*/

const globalStyles = css`
  html {
    font-size: 100%;
  }

  #__next {
    height: 100%;
  }

  .euiCodeBlock .euiCodeBlock__code {
    font-family: inherit;
  }

  a {
    color: #0077cc;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    width: 100vw;
    height: 100vh;
  }

  _next {
    width: 100%;
    height: 100%;
  }

  #mainGroup {
  }

  .euiPageTemplate {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  main {
    height: 100%;
  }

  #pageHeader {
  }

  #mainSection {
    flex-grow: 1;
    min-height: 0;
  }

  #pageHeader .euiPageHeaderContent__top {
  }

  #pageHeader .euiPageHeaderContent__top .euiFlexItem {
    margin-top: 0;
    margin-bottom: 0;
    align-content: center;
  }

  .euiBody--headerIsFixed {
    padding-top: 48px;
  }

  .euiBody--headerIsFixed .euiCollapsibleNav {
    top: 48px;
    height: calc(100% - 48px);
  }

  .euiButton {
    font-family: inherit;
  }

  .euiHeaderLogo__text {
    font-size: 22px !important;
    font-weight: 400 !important;
  }

  #main {
    width: 100%;
    height: 100%;
  }

  #main > div {
    height: 100%;
  }

  .margin2 {
    margin: 2rem;
  }

  #latexContent {
    border-radius: 6px;
  }

  #panelTabs div[role="tabpanel"] {
    height: calc(100% - 40px);
    box-sizing: border-box;
    padding: 2rem;
  }

  #essay-title img {
    vertical-align: -20%;
  }

  @media only screen and (max-width: 768px) {
    #panelTabs div[role="tabpanel"] {
      padding: 0.5rem;
    }

    #essay-title {
      display: none;
    }
  }

  body {
    transition-delay: 0s;
    transition-duration: 0.3s;
    transition-timing-function: ease-in-out;
  }

  .euiFlyout.euiFlyout--push.collapseNavAnimate {
    animation-duration: 0.3s;
    animation-timing-function: ease-in-out;
  }

  #imgEmbedContainer {
    width: 100%;
    height: 100%;
  }

  #imgEmbedContent {
    overflow: auto;
    width: 100%;
    height: 100%;
    padding: 1rem;
    border-radius: 6px;
  }

  img.cardImg {
    filter: blur(3px);
  }

  #codePanel {
    width: 100%;
    padding: 1rem;
  }

  .genericPanel div.euiCodeBlock {
    border-radius: 6px;
  }

  #panelTabs div figure {
    text-align: center;
    max-height: 100%;
  }

  #mplImg {
    max-width: 100%;
    max-height: 100%;
    padding: 1rem;
  }

  #imgEmbedContent > div.bk.bk-root {
    overflow: none;
  }

  .genericPanel {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #textContent {
    max-width: calc(65ch + 10px);
    margin-left: auto;
    margin-right: auto;
    padding-left: 2px;
    padding-right: 2px;
    overflow-y: auto;
    margin-top: auto;
    margin-bottom: auto;
    padding-top: 2px;
    padding-bottom: 2px;
    // height: calc(100% - 40px);
    // margin-top: calc(40px);
    // this color will get set to the proper EUI value
    // border-top: 1px solid grey;
  }

  .noTopBorderRadius {
    border-top-left-radius: 0 !important;
    border-top-right-radius: 0 !important;
  }

  .noBottomBorderRadius {
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
  }

  a.euiSideNavItemButton {
    text-decoration: none;
  }
`;

export default globalStyles;
