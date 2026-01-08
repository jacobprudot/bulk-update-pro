import React from 'react';
import { Box, Heading, Dropdown, TextField, Flex, RadioButton } from 'monday-ui-react-core';
import { formatColumnValue } from '../../../shared/utils/mondayHelpers';
import { getWorkspaceUsers, getLinkedBoardItems, getBoardTags } from '../services/mondayService';

/**
 * Component for selecting column and defining update value
 */
const ColumnSelector = ({ columns, selectedColumn, value, onChange, onColumnChange, boardId }) => {
  const [updateMode, setUpdateMode] = React.useState('same'); // 'same' or 'different'
  const [users, setUsers] = React.useState([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [linkedBoardItems, setLinkedBoardItems] = React.useState([]);
  const [loadingLinkedItems, setLoadingLinkedItems] = React.useState(false);
  const [tags, setTags] = React.useState([]);
  const [loadingTags, setLoadingTags] = React.useState(false);
  const [timelineFrom, setTimelineFrom] = React.useState('');
  const [timelineTo, setTimelineTo] = React.useState('');
  const [weekStart, setWeekStart] = React.useState('');
  const [weekEnd, setWeekEnd] = React.useState('');

  // Load users and tags when component mounts
  React.useEffect(() => {
    loadUsers();
    if (boardId) {
      loadTags();
    }
  }, [boardId]);

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

  const loadTags = async () => {
    setLoadingTags(true);
    try {
      const boardTags = await getBoardTags(boardId);
      setTags(boardTags);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoadingTags(false);
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

  // Handle week date changes
  const handleWeekChange = (start, end) => {
    setWeekStart(start);
    setWeekEnd(end);
    onChange({ startDate: start, endDate: end });
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
      'world-clock',    // World clock (needs timezone picker UI)
      'dependency',     // Dependency (complex relationship)
      'file',           // File upload (needs file picker UI)
      'vote',           // Vote (needs voting UI)
      'doc',            // Monday Doc (needs doc editor)
      'button',         // Button (action trigger, not data)
      'location',       // Location (needs geocoding/map picker - complex)
      'color',          // Color picker (needs proper color picker UI)
      'color_picker'    // Color picker (needs proper color picker UI)
      // ✅ NOW SUPPORTED:
      // - timeline (date range picker)
      // - board-relation (item selector)
      // - tags (tag multi-select)
      // - country (country dropdown)
      // - week (week range picker)
      // - hour (time picker)
      // - rating (star rating selector)
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

      case 'tags':
        return (
          <Box>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
              Select tag
            </label>
            {loadingTags ? (
              <p style={{ color: '#666', fontSize: '14px' }}>Loading tags...</p>
            ) : tags.length === 0 ? (
              <p style={{ color: '#666', fontSize: '14px' }}>No tags found in board</p>
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
                <option value="">-- Select a tag --</option>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            )}
          </Box>
        );

      case 'country':
        const countries = [
          { code: 'US', name: 'United States' },
          { code: 'GB', name: 'United Kingdom' },
          { code: 'CA', name: 'Canada' },
          { code: 'MX', name: 'Mexico' },
          { code: 'BR', name: 'Brazil' },
          { code: 'AR', name: 'Argentina' },
          { code: 'CL', name: 'Chile' },
          { code: 'CO', name: 'Colombia' },
          { code: 'ES', name: 'Spain' },
          { code: 'FR', name: 'France' },
          { code: 'DE', name: 'Germany' },
          { code: 'IT', name: 'Italy' },
          { code: 'PT', name: 'Portugal' },
          { code: 'NL', name: 'Netherlands' },
          { code: 'BE', name: 'Belgium' },
          { code: 'CH', name: 'Switzerland' },
          { code: 'AT', name: 'Austria' },
          { code: 'PL', name: 'Poland' },
          { code: 'RU', name: 'Russia' },
          { code: 'CN', name: 'China' },
          { code: 'JP', name: 'Japan' },
          { code: 'KR', name: 'South Korea' },
          { code: 'IN', name: 'India' },
          { code: 'AU', name: 'Australia' },
          { code: 'NZ', name: 'New Zealand' },
          { code: 'ZA', name: 'South Africa' },
          { code: 'IL', name: 'Israel' }
        ];

        return (
          <Box>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
              Select country
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
              <option value="">-- Select a country --</option>
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </Box>
        );

      case 'week':
        return (
          <Box>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
              Week range
            </label>
            <Flex direction="Row" gap={Flex.gaps.MEDIUM} style={{ marginBottom: '8px' }}>
              <Box style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                  Week start date
                </label>
                <input
                  type="date"
                  value={weekStart}
                  onChange={(e) => handleWeekChange(e.target.value, weekEnd)}
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
                  Week end date
                </label>
                <input
                  type="date"
                  value={weekEnd}
                  onChange={(e) => handleWeekChange(weekStart, e.target.value)}
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
              Select start and end dates for the week (typically Monday to Sunday)
            </p>
          </Box>
        );

      case 'hour':
        return (
          <Box>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
              Time
            </label>
            <input
              type="time"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #c5c7d0',
                borderRadius: '4px',
                backgroundColor: 'white'
              }}
            />
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
              Select a time in 24-hour format
            </p>
          </Box>
        );

      case 'rating':
        return (
          <Box>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
              Rating
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
              <option value="">-- Select rating --</option>
              <option value="1">⭐ 1 Star</option>
              <option value="2">⭐⭐ 2 Stars</option>
              <option value="3">⭐⭐⭐ 3 Stars</option>
              <option value="4">⭐⭐⭐⭐ 4 Stars</option>
              <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
            </select>
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
