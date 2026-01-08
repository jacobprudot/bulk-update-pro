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
        const statusOptions = Object.keys(settings.labels || {}).map(key => ({
          value: settings.labels[key],
          label: settings.labels[key]
        }));

        return (
          <Dropdown
            placeholder="Select a status"
            options={statusOptions}
            value={value}
            onChange={(option) => onChange(option.value)}
          />
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
        const dropdownOptions = (dropdownSettings.labels || []).map(label => ({
          value: label.name,
          label: label.name
        }));

        return (
          <Dropdown
            placeholder="Select an option"
            options={dropdownOptions}
            value={value}
            onChange={(option) => onChange(option.value)}
          />
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

        <Dropdown
          placeholder="Select column to update"
          options={columnOptions}
          value={selectedColumn}
          onChange={(option) => onColumnChange(option.value)}
        />

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
