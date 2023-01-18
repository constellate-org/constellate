import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiTabbedContent,
  EuiInMemoryTable,
  EuiTableFieldDataColumnType,
} from "@elastic/eui";
import { useCallback, useState } from "react";

import SrcBlock from "./src_block";

// Data Grid assumes all string values, which is a little weird but whatever
export function to_strings(data) {
  return data.map((row) => {
    const newRow = {};
    Object.entries(row).forEach(([k, v]) => {
      newRow[k] = String(v);
    });
    return newRow;
  });
}

function render(schema, data) {
  if (schema === "datetime") {
    return new Date(data).toLocaleString();
  } else {
    return data;
  }
}

export default function DFPanel(props) {
  const { code, data } = props;
  // const { euiTheme, colorMode } = useEuiTheme();

  const colnames = data.length > 0 ? Object.keys(data[0]) : [];
  const cols: EuiTableFieldDataColumnType<string>[] = colnames.map(
    (colname) => {
      return {
        field: colname,
        name: colname,
        dataType: "auto",
      };
    }
  );

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const onChangeItemsPerPage = useCallback(
    (pageSize) =>
      setPagination((pagination) => ({
        ...pagination,
        pageSize,
        pageIndex: 0,
      })),
    [setPagination]
  );

  const onTableChange = ({ page = {} }) => {
    const { index: pageIndex, size: pageSize } = page;

    setPagination({
      pageIndex,
      pageSize,
    });
  };

  // Sorting
  const [sortingColumns, setSortingColumns] = useState([]);
  const onSort = useCallback(
    (sortingColumns) => {
      setSortingColumns(sortingColumns);
    },
    [setSortingColumns]
  );

  const [visibleColumns, setVisibleColumns] = useState(
    cols.map(({ id }) => id)
  );

  const tabs = [
    {
      id: "df",
      name: "Data",
      content: (
        <EuiFlexGroup
          direction="column"
          justifyContent="center"
          className="eui-fullHeight"
        >
          <EuiFlexItem grow>
            <EuiPanel>
              <EuiInMemoryTable
                aria-labelledby={"Table"}
                columns={cols}
                items={data}
                tableLayout="auto"
                sorting={true}
                pagination={true}
              />
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>
      ),
    },
    {
      id: "code",
      name: "Code",
      className: "eui-fullHeight",
      content: <SrcBlock>{code}</SrcBlock>,
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
