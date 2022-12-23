import {
    EuiCodeBlock,
    EuiDataGrid,
    EuiFlexGroup,
    EuiFlexItem,
    EuiPanel,
    EuiTabbedContent,
} from '@elastic/eui';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';

// Data Grid assumes all string values, which is a little weird but whatever
export function to_strings(data) {
    return data.map(row => {
        const newRow = {};
        Object.entries(row).forEach(([k, v]) => {
            newRow[k] = String(v);
        });
        return newRow;
    });
}

function render(schema, data) {
    if (schema === 'datetime') {
        return new Date(data).toLocaleString();
    } else {
        return data;
    }
}

export default function DFPanel(props) {
    const { code, data } = props;
    // const { euiTheme, colorMode } = useEuiTheme();

    const colnames = data.length > 0 ? Object.keys(data[0]) : [];
    const cols = colnames.map(colname => {
        return {
            id: colname,
        };
    });

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
    const onChangeItemsPerPage = useCallback(
        pageSize =>
            setPagination(pagination => ({
                ...pagination,
                pageSize,
                pageIndex: 0,
            })),
        [setPagination]
    );
    const onChangePage = useCallback(
        pageIndex => setPagination(pagination => ({ ...pagination, pageIndex })),
        [setPagination]
    );

    // Sorting
    const [sortingColumns, setSortingColumns] = useState([]);
    const onSort = useCallback(
        sortingColumns => {
            setSortingColumns(sortingColumns);
        },
        [setSortingColumns]
    );

    const [visibleColumns, setVisibleColumns] = useState(
        cols.map(({ id }) => id)
    );

    const router = useRouter();

    const tabs = [
        {
            id: 'df',
            name: 'Data',
            content: typeof window !== 'undefined' && (
                <EuiFlexGroup
                    direction="column"
                    justifyContent="center"
                    className="eui-fullHeight"
                    key={router.asPath}>
                    <EuiFlexItem grow>
                        <EuiPanel>
                            <EuiDataGrid
                                aria-labelledby={'Table'}
                                columns={cols}
                                columnVisibility={{ visibleColumns, setVisibleColumns }}
                                rowCount={data.length}
                                renderCellValue={({ rowIndex, columnId, schema }) =>
                                    render(schema, data[rowIndex][columnId])
                                }
                                inMemory={{ level: 'sorting' }}
                                sorting={{ columns: sortingColumns, onSort }}
                                pagination={{
                                    ...pagination,
                                    pageSizeOptions: [10, 15, 20, 30, 50, 100],
                                    onChangeItemsPerPage: onChangeItemsPerPage,
                                    onChangePage: onChangePage,
                                }}
                                rowHeightsOptions={{ defaultHeight: 'auto' }}
                                schemaDetectors={[]}
                            />
                        </EuiPanel>
                    </EuiFlexItem>
                </EuiFlexGroup>
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
        <EuiTabbedContent
            tabs={tabs}
            initialSelectedTab={tabs[0]}
            className="eui-fullHeight"
            id="panelTabs"
            expand={true}
        />
    );
}
