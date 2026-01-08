import React from 'react';
import { Box, Heading, Dropdown, TextField, Flex, RadioButton } from 'monday-ui-react-core';
import { formatColumnValue } from '../../../shared/utils/mondayHelpers';
import { getWorkspaceUsers, getLinkedBoardItems } from '../services/mondayService';

/**
 * Component for selecting column and defining update value
 */
const ColumnSelector = ({ columns, selectedColumn, value, onChange, onColumnChange }) => {
  const [updateMode, setUpdateMode] = React.useState('same'); // 'same' or 'different'
  const [users, setUsers] = React.useState([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [linkedBoardItems, setLinkedBoardItems] = React.useState([]);
  const [loadingLinkedItems, setLoadingLinkedItems] = React.useState(false);
  const [timelineFrom, setTimelineFrom] = React.useState('');
  const [timelineTo, setTimelineTo] = React.useState('');

  // Load users when component mounts
  React.useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const workspaceUsers = await getWorkspaceUsers();
      setUsers(workspaceUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load linked board items when board-relation column is selected
  React.useEffect(() => {
    const loadLinkedBoardItems = async () => {
      if (selectedColumnData?.type === 'board-relation') {
        setLoadingLinkedItems(true);
        try {
          const settings = selectedColumnData.settings_str ?
            JSON.parse(selectedColumnData.settings_str) : {};
          const linkedBoardIds = settings.boardIds || [];

          if (linkedBoardIds.length > 0) {
            // Load items from the first linked board
            const items = await getLinkedBoardItems(linkedBoardIds[0]);
            setLinkedBoardItems(items);
          }
        } catch (error) {
          console.error('Error loading linked board items:', error);
        } finally {
          setLoadingLinkedItems(false);
        }
      }
    };

    loadLinkedBoardItems();
  }, [selectedColumn, selectedColumnData]);

  // Handle timeline date changes
  const handleTimelineChange = (from, to) => {
    setTimelineFrom(from);
    setTimelineTo(to);
    onChange({ from, to });
  };

  // Filter only editable columns with proper UI support
  // Exclude read-only, calculated, and complex columns without UI implementation
  const editableColumns = columns.filter(col =>
    ![
      'name',           // Item name (special handling)
      'mirror',         // Mirror columns (read-only)
      'formula',        // Formula columns (calculated, read-only)
      'auto-number',    // Auto-number (automatic, read-only)
      'last-updated',   // Last updated (automatic, read-only)
      'creation-log',   // Creation log (automatic, read-only)
      'item_id',        // Item ID (automatic, read-only)
      'progress',       // Progress tracking (calculated, read-only)
      'time_tracking',  // Time tracking (needs complex time entry UI)
      'world-clock',    // World clock (needs timezone picker)
      'dependency',     // Dependency (complex relationship)
      'file',           // File upload (needs file picker UI)
      'vote',           // Vote (needs voting UI)
      'doc',            // Monday Doc (needs doc editor)
      'button',         // Button (action trigger, not data)
      // Note: The following are now supported with proper UI:
      // - timeline (date range picker)
      // - board-relation (item selector)
      // - tags (will need tag selector UI - TODO)
      // - country (will need country picker - TODO)
      // - week (will need week picker - TODO)
      // - hour (will need time picker - TODO)
      // - location (will need location picker - TODO)
      // - rating (will need rating UI - TODO)
      // - color/color_picker (will need color picker - TODO)
      'tags',           // Tags (needs tag selector UI)
      'country',        // Country (needs country picker)
      'week',           // Week (needs week picker)
      'hour',           // Hour (needs time picker)
      'location',       // Location (needs map/location picker)
      'rating',         // Rating (needs rating stars UI)
      'color',          // Color picker (needs color picker UI)
      'color_picker'    // Color picker (needs color picker UI)
    ].includes(col.type)
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

      case 'people':
      case 'multiple-person':
        return (
          <Box>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
              Select person
            </label>
            {loadingUsers ? (
              <p style={{ color: '#666', fontSize: '14px' }}>Loading users...</p>
            ) : (
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
                <option value="">-- Select a person --</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            )}
          </Box>
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

      case 'timeline':
        return (
          <Box>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
              Timeline dates
            </label>
            <Flex direction="Row" gap={Flex.gaps.MEDIUM} style={{ marginBottom: '8px' }}>
              <Box style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                  Start date
                </label>
                <input
                  type="date"
                  value={timelineFrom}
                  onChange={(e) => handleTimelineChange(e.target.value, timelineTo)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '14px',
                    border: '1px solid #c5c7d0',
                    borderRadius: '4px',
                    backgroundColor: 'white'
                  }}
                />
              </Box>
              <Box style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                  End date
                </label>
                <input
                  type="date"
                  value={timelineTo}
                  onChange={(e) => handleTimelineChange(timelineFrom, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '14px',
                    border: '1px solid #c5c7d0',
                    borderRadius: '4px',
                    backgroundColor: 'white'
                  }}
                />
              </Box>
            </Flex>
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
              Select start and end dates for the timeline
            </p>
          </Box>
        );

      case 'board-relation':
        return (
          <Box>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
              Select linked item
            </label>
            {loadingLinkedItems ? (
              <p style={{ color: '#666', fontSize: '14px' }}>Loading items...</p>
            ) : linkedBoardItems.length === 0 ? (
              <p style={{ color: '#666', fontSize: '14px' }}>No items found in linked board</p>
            ) : (
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
                <option value="">-- Select an item --</option>
                {linkedBoardItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            )}
          </Box>
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
