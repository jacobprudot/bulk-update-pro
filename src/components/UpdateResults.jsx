import React from 'react';
import { Box, Heading, Flex, Button, Icon } from 'monday-ui-react-core';

/**
 * Component to display bulk update results
 */
const UpdateResults = ({ results, onClose, onExport }) => {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  const exportResults = () => {
    const csvContent = [
      ['Item ID', 'Item Name', 'Status', 'Error'].join(','),
      ...results.map(r => [
        r.itemId,
        r.itemName || 'N/A',
        r.success ? 'Success' : 'Failed',
        r.error || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bulk-update-results-${new Date().toISOString()}.csv`;
    link.click();
  };

  return (
    <Box padding={Box.paddings.LARGE}>
      <Flex direction="Column" gap={Flex.gaps.LARGE}>
        <Heading type={Heading.types.H2} value="Update Results" />

        {/* Resumen */}
        <Flex gap={Flex.gaps.MEDIUM}>
          <Box style={{
            flex: 1,
            padding: '16px',
            background: '#e8f5e9',
            borderRadius: '8px',
            border: '1px solid #4caf50'
          }}>
            <Heading type={Heading.types.H1} value={successful.length.toString()} />
            <p style={{ margin: '4px 0 0 0', color: '#2e7d32', fontWeight: 600 }}>
              ✓ Successful
            </p>
          </Box>

          {failed.length > 0 && (
            <Box style={{
              flex: 1,
              padding: '16px',
              background: '#ffebee',
              borderRadius: '8px',
              border: '1px solid #f44336'
            }}>
              <Heading type={Heading.types.H1} value={failed.length.toString()} />
              <p style={{ margin: '4px 0 0 0', color: '#c62828', fontWeight: 600 }}>
                ✗ Failed
              </p>
            </Box>
          )}
        </Flex>

        {/* Lista de errores (si hay) */}
        {failed.length > 0 && (
          <Box>
            <Heading type={Heading.types.H3} value="Items with Errors" />
            <Box style={{
              maxHeight: '300px',
              overflowY: 'auto',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              marginTop: '8px'
            }}>
              {failed.map((result, index) => (
                <Box
                  key={index}
                  style={{
                    padding: '12px',
                    borderBottom: index < failed.length - 1 ? '1px solid #e0e0e0' : 'none',
                    background: index % 2 === 0 ? '#fff' : '#f9f9f9'
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 600 }}>
                    {result.itemName || `Item ${result.itemId}`}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#c62828' }}>
                    {result.error || 'Unknown error'}
                  </p>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Acciones */}
        <Flex gap={Flex.gaps.MEDIUM} justify="FlexEnd">
          <Button
            onClick={exportResults}
            kind={Button.kinds.TERTIARY}
          >
            Export Results (CSV)
          </Button>
          <Button
            onClick={onClose}
            kind={Button.kinds.PRIMARY}
          >
            Close
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default UpdateResults;