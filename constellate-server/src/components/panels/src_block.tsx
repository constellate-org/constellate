import { EuiCodeBlockProps } from "@elastic/eui";
import dynamic from "next/dynamic";

const EuiCodeBlock: React.ComponentType<EuiCodeBlockProps> = dynamic(() =>
  import("@elastic/eui").then((mod) => mod.EuiCodeBlock)
);

export default function SrcBlock({ children }: { children: React.ReactNode }) {
  return (
    <EuiCodeBlock
      language="python"
      lineNumbers
      overflowHeight="100%"
      fontSize="m"
      paddingSize="m"
      isCopyable={true}
      isVirtualized
      className="codeBlockEmbed"
    >
      {children}
    </EuiCodeBlock>
  );
}
