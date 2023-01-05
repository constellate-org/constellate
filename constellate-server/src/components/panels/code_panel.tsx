import { EuiSplitPanel, EuiTitle, EuiPanel, EuiCodeBlockProps } from '@elastic/eui';
import dynamic from 'next/dynamic'

const EuiCodeBlock: React.ComponentType<EuiCodeBlockProps> = dynamic(() => import('@elastic/eui').then((mod) => mod.EuiCodeBlock))

export default function CodePanel(props) {
    return (
        <EuiSplitPanel.Outer
            className="eui-fullHeight gradientBg"
            hasShadow
            direction="column"
            id="codePanel">
            <EuiSplitPanel.Inner grow>
                <EuiPanel
                    color="plain"
                    paddingSize="none"
                    className="noBottomBorderRadius">
                    <EuiTitle size="xs">
                        <span style={{ padding: '1rem' }}>Code</span>
                    </EuiTitle>
                </EuiPanel>
                <EuiCodeBlock
                    language={props.lang}
                    lineNumbers
                    overflowHeight="calc(100% - 28px)"
                    fontSize="m"
                    paddingSize="m"
                    isCopyable={true}
                    isVirtualized
                    className="codeBlockEmbed noTopBorderRadius">
                    {props.code}
                </EuiCodeBlock>
            </EuiSplitPanel.Inner>
            {props.output && (
                <EuiSplitPanel.Inner grow={false}>
                    <EuiPanel
                        color="plain"
                        paddingSize="s"
                        className="noBottomBorderRadius">
                        <EuiTitle size="xs">
                            <span>Output</span>
                        </EuiTitle>
                    </EuiPanel>
                    <EuiCodeBlock
                        whiteSpace="pre-wrap"
                        fontSize="l"
                        paddingSize="m"
                        isCopyable={true}
                        className="codeBlockEmbed noTopBorderRadius">
                        {props.output}
                    </EuiCodeBlock>
                </EuiSplitPanel.Inner>
            )}
        </EuiSplitPanel.Outer>
    );
}
