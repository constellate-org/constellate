import {
    EuiFlexGroup,
    EuiFlexItem,
    EuiTabbedContent,
} from '@elastic/eui';

import Image from "next/legacy/image";
import SrcBlock from './src_block';

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
                <SrcBlock>
                    {code}
                </SrcBlock>
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
