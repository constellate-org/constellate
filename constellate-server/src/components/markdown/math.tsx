import { InlineMath, BlockMath } from "./create_comp";
import macros from "./preamble";

export type MathParserOptions = {
  singleDollar?: boolean;
};

export function MathMarkdownParser({
  singleDollar = false,
}: MathParserOptions) {
  const Parser = this.Parser;
  const tokenizers = Parser.prototype.inlineTokenizers;
  const methods = Parser.prototype.inlineMethods;

  // function to parse a matching string
  function tokenizeMath(eat, value, silent) {
    // match display mode
    let tokenMatch = value.match(/^\$\$([^$]+?)\$\$/);
    let mode;
    if (tokenMatch !== null) {
      mode = "block";
    } else if (singleDollar) {
      // now attempt to match inline math
      tokenMatch = value.match(/^\$([^\n$]+?)\$/);

      if (tokenMatch != null) {
        mode = "inline";
      }
    }

    if (tokenMatch == null) {
      return false;
    }

    const [whole, math] = tokenMatch;

    if (silent) {
      return true;
    }
    // must consume the exact & entire match string
    return eat(whole)({
      type: "mathplugin",
      math: math, // configuration is passed to the renderer
      mode: mode,
    });
  }

  // function to detect where the next math match might be found
  tokenizeMath.locator = (value, fromIndex) => {
    return value.indexOf("$", fromIndex);
  };

  // define the math plugin and inject it just before the existing text plugin
  tokenizers.math = tokenizeMath;
  methods.splice(0, 0, "math");
}

// this will inevitably produce divs in ps, idk how to fix it
export function KatexRenderer(props) {
  const { math, mode } = props;
  if (mode === "block") {
    return <BlockMath math={math} macros={macros} trust={true} />;
  } else {
    return <InlineMath math={math} macros={macros} trust={true} />;
  }
}
