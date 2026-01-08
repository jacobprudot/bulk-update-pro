import React from 'react';
import { Box, Heading, Dropdown, TextField, Flex, RadioButton } from 'monday-ui-react-core';
import { formatColumnValue } from '../../../shared/utils/mondayHelpers';

/**
 * Component for selecting column and defining update value
 */
const ColumnSelector = ({ columns, selectedColumn, value, onChange, onColumnChange }) => {
  const [updateMode, setUpdateMode] = React.useState('same'); // 'same' or 'different'

  // Filter only editable columns (exclude name, mirror, formula, etc)
  const editableColumns = columns.filter(col =>
    !['name', 'mirror', 'formula', 'auto-number', 'last-updated', 'creation-log'].includes(col.type)
  );

  const columnOptions = editableColumns.map(col => ({
    value: col.id,
    label: `${col.title} (${col.type})`
  }));

  const selectedColumnData = columns.find(col => col.id === selectedColumn);

  const renderValueInput = () => {
    if (!selectedColumnData) {
      return (
        <Box padding={Box.paddings.MEDIUM}>
          <p style={{ color: '#666', textAlign: 'center' }}>
            Select a column to continue
          </p>
        </Box>
      );
    }

    const { type } = selectedColumnData;

    switch (type) {
      case 'text':
      case 'long-text':
        return (
          <TextField
            title="New value"
            placeholder="Enter text..."
            value={value}
            onChange={onChange}
            size={TextField.sizes.MEDIUM}
          />
        );

      case 'numbers':
        return (
          <TextField
            title="New value"
            placeholder="Enter number..."
            value={value}
            onChange={onChange}
            type="number"
            size={TextField.sizes.MEDIUM}
          />
        );

      case 'status':
        const settings = selectedColumnData.settings_str ?
          JSON.parse(selectedColumnData.settings_str) : {};
        const statusLabels = settings.labels || {};

        return (
          <Box>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
              New status value
            </label>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #c5c7d0',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">-- Select a status --</option>
              {Object.keys(statusLabels).map(key => (
                <option key={key} value={statusLabels[key]}>
                  {statusLabels[key]}
                </option>
              ))}
            </select>
          </Box>
        );

      case 'date':
        return (
          <TextField
            title="Date (YYYY-MM-DD)"
            placeholder="2024-01-31"
            value={value}
            onChange={onChange}
            type="date"
            size={TextField.sizes.MEDIUM}
          />
        );

      case 'checkbox':
        return (
          <Flex direction="Column" gap={Flex.gaps.SMALL}>
            <Heading type={Heading.types.H4} value="New value" />
            <RadioButton
              text="Checked"
              value="true"
              checked={value === 'true'}
              onSelect={() => onChange('true')}
            />
            <RadioButton
              text="Unchecked"
              value="false"
              checked={value === 'false'}
              onSelect={() => onChange('false')}
            />
          </Flex>
        );

      case 'dropdown':
        const dropdownSettings = selectedColumnData.settings_str ?
          JSON.parse(selectedColumnData.settings_str) : {};
        const dropdownLabels = dropdownSettings.labels || [];

        return (
          <Box>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
              New dropdown value
            </label>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #c5c7d0',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">-- Select an option --</option>
              {dropdownLabels.map((label, idx) => (
                <option key={idx} value={label.name}>
                  {label.name}
                </option>
              ))}
            </select>
          </Box>
        );

      case 'email':
        return (
          <TextField
            title="Email"
            placeholder="user@example.com"
            value={value}
            onChange={onChange}
            type="email"
            size={TextField.sizes.MEDIUM}
          />
        );

      case 'phone':
        return (
          <TextField
            title="Phone"
            placeholder="+1 234 567 8900"
            value={value}
            onChange={onChange}
            type="tel"
            size={TextField.sizes.MEDIUM}
          />
        );

      case 'link':
        return (
          <TextField
            title="URL"
            placeholder="https://example.com"
            value={value}
            onChange={onChange}
            type="url"
            size={TextField.sizes.MEDIUM}
          />
        );

      default:
        return (
          <TextField
            title="New value"
            placeholder="Enter value..."
            value={value}
            onChange={onChange}
            size={TextField.sizes.MEDIUM}
          />
        );
    }
  };

  return (
    <Box padding={Box.paddings.MEDIUM}>
      <Flex direction="Column" gap={Flex.gaps.LARGE}>
        <Heading type={Heading.types.H3} value="Select Column and Value" />

        <Box>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
            Select column to update
          </label>
          <select
            value={selectedColumn}
            onChange={(e) => onColumnChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid #c5c7d0',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="">-- Select a column --</option>
            {editableColumns.map(col => (
              <option key={col.id} value={col.id}>
                {col.title} ({col.type})
              </option>
            ))}
          </select>
        </Box>

        {selectedColumnData && (
          <>
            <Box style={{ borderTop: '1px solid #e0e0e0', paddingTop: '16px' }}>
              {renderValueInput()}
            </Box>

            <Box style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
              <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                <strong>Column type:</strong> {selectedColumnData.type}
              </p>
              <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
                All selected items will be updated with this value
              </p>
            </Box>
          </>
        )}
      </Flex>
    </Box>
  );
};

export default ColumnSelector;
