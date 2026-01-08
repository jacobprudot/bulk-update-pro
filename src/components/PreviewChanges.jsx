import React from 'react';
import { Box, Heading, Flex, Table, Button } from 'monday-ui-react-core';
import { getColumnText } from '../../../shared/utils/mondayHelpers';

/**
 * Component to preview changes before applying them
 */
const PreviewChanges = ({ items, selectedItems, selectedColumn, newValue, columns, onConfirm, onCancel }) => {
  const selectedItemsData = items.filter(item => selectedItems.includes(item.id));
  const columnData = columns.find(col => col.id === selectedColumn);

  if (!columnData) {
    return null;
  }

  const tableColumns = [
    {
      id: 'name',
      title: 'Item',
      width: 200
    },
    {
      id: 'currentValue',
      title: 'Current Value',
      width: 150
    },
    {
      id: 'newValue',
      title: 'New Value',
      width: 150
    }
  ];

  const tableData = selectedItemsData.map(item => {
    const currentColumn = item.column_values?.find(col => col.id === selectedColumn);
    const currentValue = currentColumn ? getColumnText(currentColumn) : '(empty)';

    return {
      id: item.id,
      name: item.name,
      currentValue: currentValue || '(empty)',
      newValue: newValue || '(empty)'
    };
  });

  return (
    <Box padding={Box.paddings.MEDIUM}>
      <Flex direction="Column" gap={Flex.gaps.LARGE}>
        <Heading type={Heading.types.H3} value="Preview Changes" />

        <Box style={{ background: '#fff3cd', padding: '12px', borderRadius: '4px', border: '1px solid #ffc107' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
            <strong>Attention:</strong> You are about to update <strong>{selectedItemsData.length}</strong> item(s)
            in column <strong>{columnData.title}</strong>
          </p>
        </Box>

        <Box style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f5f5f5', position: 'sticky', top: 0 }}>
              <tr>
                {tableColumns.map(col => (
                  <th
                    key={col.id}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #e0e0e0',
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr
                  key={row.id}
                  style={{
                    background: index % 2 === 0 ? '#fff' : '#f9f9f9'
                  }}
                >
                  <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                    {row.name}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0', color: '#666' }}>
                    {row.currentValue}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0', fontWeight: 600, color: '#0073ea' }}>
                    {row.newValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        <Flex gap={Flex.gaps.MEDIUM} justify="FlexEnd">
          <Button onClick={onCancel} kind={Button.kinds.TERTIARY}>
            Cancel
          </Button>
          <Button onClick={onConfirm} kind={Button.kinds.PRIMARY}>
            Confirm and Apply Changes
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default PreviewChanges;
