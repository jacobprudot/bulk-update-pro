import React from 'react';
import { Box, Heading, Dropdown, TextField, Flex, RadioButton } from 'monday-ui-react-core';
import { formatColumnValue, safeJsonParse } from '../utils/mondayHelpers';
import { getWorkspaceUsers, getLinkedBoardItems, getBoardTags } from '../services/mondayService';

/**
 * Component for selecting column and defining update value
 */
const ColumnSelector = ({ columns, selectedColumn, value, onChange, onColumnChange, boardId, isDarkMode }) => {
  const [updateMode, setUpdateMode] = React.useState('same'); // 'same' or 'different'

  // Theme-aware colors
  const textColor = isDarkMode ? '#ffffff' : '#323338';
  const mutedColor = isDarkMode ? '#9699a6' : '#666';
  const inputBgColor = isDarkMode ? '#30324e' : 'white';
  const inputBorderColor = isDarkMode ? '#4b4e69' : '#c5c7d0';
  const borderColor = isDarkMode ? '#4b4e69' : '#e0e0e0';
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

  // Use useMemo to prevent recreation on every render
  const selectedColumnData = React.useMemo(() => {
    return columns.find(col => col.id === selectedColumn);
  }, [columns, selectedColumn]);

  // Define editable columns with useMemo
  const editableColumns = React.useMemo(() => {
    return columns.filter(col =>
      ![
        'name',           // Item name (special handling)
        'mirror',         // Mirror columns (read-only)
        'formula',        // Formula columns (calculated, read-only)
        'auto-number',    // Auto-number (automatic, read-only)
        'last-updated',   // Last updated (automatic, read-only)
        'creation-log',   // Creation log (automatic, read-only)
        'item_id',        // Item ID (automatic, read-only)
        'progress',       // Progress tracking (calculated, read-only)
        'dependency',     // Dependency (complex item relationships)
        'file',           // File upload (requires file upload UI)
        'vote',           // Vote (requires voting mechanism UI)
        'doc',            // Monday Doc (requires document editor)
        'button',         // Button (action trigger, not data storage)
        'time_tracking'   // Time tracking (API does not support updates)
      ].includes(col.type)
    );
  }, [columns]);

  const columnOptions = React.useMemo(() => {
    return editableColumns.map(col => ({
      value: col.id,
      label: `${col.title} (${col.type})`
    }));
  }, [editableColumns]);

  // Load users when component mounts
  React.useEffect(() => {
    const loadUsersAsync = async () => {
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
    loadUsersAsync();
  }, []);

  // Load tags when boardId changes
  React.useEffect(() => {
    if (!boardId) return;

    const loadTagsAsync = async () => {
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
    loadTagsAsync();
  }, [boardId]);

  // Load linked board items when board-relation column is selected
  React.useEffect(() => {
    // Find the column data inside the effect to avoid TDZ issues
    const colData = columns.find(col => col.id === selectedColumn);

    if (!colData || colData.type !== 'board-relation') {
      return;
    }

    const loadLinkedItems = async () => {
      setLoadingLinkedItems(true);
      try {
        const settings = safeJsonParse(colData.settings_str);
        const linkedBoardIds = settings.boardIds || [];

        if (linkedBoardIds.length > 0) {
          const items = await getLinkedBoardItems(linkedBoardIds[0]);
          setLinkedBoardItems(items);
        }
      } catch (error) {
        console.error('Error loading linked board items:', error);
      } finally {
        setLoadingLinkedItems(false);
      }
    };

    loadLinkedItems();
  }, [selectedColumn, columns]);

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

  const renderValueInput = () => {
    if (!selectedColumnData) {
      return (
        <Box padding={Box.paddings.MEDIUM}>
          <p style={{ color: mutedColor, textAlign: 'center' }}>
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
          safeJsonParse(selectedColumnData.settings_str) : {};
        const statusLabels = settings.labels || {};

        return (
          <Box>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: textColor }}>
              New status value
            </label>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: `1px solid ${inputBorderColor}`,
                borderRadius: '4px',
                backgroundColor: inputBgColor,
                color: textColor,
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
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: textColor }}>
              Select person
            </label>
            {loadingUsers ? (
              <p style={{ color: mutedColor, fontSize: '14px' }}>Loading users...</p>
            ) : (
              <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: `1px solid ${inputBorderColor}`,
                  borderRadius: '4px',
                  backgroundColor: inputBgColor,
                  color: textColor,
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
          safeJsonParse(selectedColumnData.settings_str) : {};
        const dropdownLabels = dropdownSettings.labels || [];

        return (
          <Box>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: textColor }}>
              New dropdown value
            </label>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: `1px solid ${inputBorderColor}`,
                borderRadius: '4px',
                backgroundColor: inputBgColor,
                color: textColor,
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
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: textColor }}>
              Timeline dates
            </label>
            <Flex direction="Row" gap={Flex.gaps.MEDIUM} style={{ marginBottom: '8px' }}>
              <Box style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: mutedColor }}>
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
                    border: `1px solid ${inputBorderColor}`,
                    borderRadius: '4px',
                    backgroundColor: inputBgColor,
                    color: textColor
                  }}
                />
              </Box>
              <Box style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: mutedColor }}>
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
                    border: `1px solid ${inputBorderColor}`,
                    borderRadius: '4px',
                    backgroundColor: inputBgColor,
                    color: textColor
                  }}
                />
              </Box>
            </Flex>
            <p style={{ fontSize: '12px', color: mutedColor, margin: '4px 0 0 0' }}>
              Select start and end dates for the timeline
            </p>
          </Box>
        );

      case 'board-relation':
        return (
          <Box>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: textColor }}>
              Select linked item
            </label>
            {loadingLinkedItems ? (
              <p style={{ color: mutedColor, fontSize: '14px' }}>Loading items...</p>
            ) : linkedBoardItems.length === 0 ? (
              <p style={{ color: mutedColor, fontSize: '14px' }}>No items found in linked board</p>
            ) : (
              <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: `1px solid ${inputBorderColor}`,
                  borderRadius: '4px',
                  backgroundColor: inputBgColor,
                  color: textColor,
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
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: textColor }}>
              Select tag
            </label>
            {loadingTags ? (
              <p style={{ color: mutedColor, fontSize: '14px' }}>Loading tags...</p>
            ) : tags.length === 0 ? (
              <p style={{ color: mutedColor, fontSize: '14px' }}>No tags found in board</p>
            ) : (
              <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: `1px solid ${inputBorderColor}`,
                  borderRadius: '4px',
                  backgroundColor: inputBgColor,
                  color: textColor,
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
          { code: 'PE', name: 'Peru' },
          { code: 'VE', name: 'Venezuela' },
          { code: 'EC', name: 'Ecuador' },
          { code: 'UY', name: 'Uruguay' },
          { code: 'PY', name: 'Paraguay' },
          { code: 'BO', name: 'Bolivia' },
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
          { code: 'SE', name: 'Sweden' },
          { code: 'NO', name: 'Norway' },
          { code: 'DK', name: 'Denmark' },
          { code: 'FI', name: 'Finland' },
          { code: 'IE', name: 'Ireland' },
          { code: 'GR', name: 'Greece' },
          { code: 'CZ', name: 'Czech Republic' },
          { code: 'RO', name: 'Romania' },
          { code: 'HU', name: 'Hungary' },
          { code: 'RU', name: 'Russia' },
          { code: 'UA', name: 'Ukraine' },
          { code: 'CN', name: 'China' },
          { code: 'JP', name: 'Japan' },
          { code: 'KR', name: 'South Korea' },
          { code: 'IN', name: 'India' },
          { code: 'ID', name: 'Indonesia' },
          { code: 'TH', name: 'Thailand' },
          { code: 'VN', name: 'Vietnam' },
          { code: 'PH', name: 'Philippines' },
          { code: 'MY', name: 'Malaysia' },
          { code: 'SG', name: 'Singapore' },
          { code: 'AU', name: 'Australia' },
          { code: 'NZ', name: 'New Zealand' },
          { code: 'ZA', name: 'South Africa' },
          { code: 'EG', name: 'Egypt' },
          { code: 'NG', name: 'Nigeria' },
          { code: 'KE', name: 'Kenya' },
          { code: 'IL', name: 'Israel' },
          { code: 'AE', name: 'United Arab Emirates' },
          { code: 'SA', name: 'Saudi Arabia' },
          { code: 'TR', name: 'Turkey' }
        ];

        const handleCountryChange = (e) => {
          const selectedCode = e.target.value;
          const selectedCountry = countries.find(c => c.code === selectedCode);
          if (selectedCountry) {
            onChange({ countryCode: selectedCountry.code, countryName: selectedCountry.name });
          } else {
            onChange('');
          }
        };

        return (
          <Box>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: textColor }}>
              Select country
            </label>
            <select
              value={typeof value === 'object' ? value.countryCode : value}
              onChange={handleCountryChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: `1px solid ${inputBorderColor}`,
                borderRadius: '4px',
                backgroundColor: inputBgColor,
                color: textColor,
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
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: textColor }}>
              Week range
            </label>
            <Flex direction="Row" gap={Flex.gaps.MEDIUM} style={{ marginBottom: '8px' }}>
              <Box style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: mutedColor }}>
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
                    border: `1px solid ${inputBorderColor}`,
                    borderRadius: '4px',
                    backgroundColor: inputBgColor,
                    color: textColor
                  }}
                />
              </Box>
              <Box style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: mutedColor }}>
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
                    border: `1px solid ${inputBorderColor}`,
                    borderRadius: '4px',
                    backgroundColor: inputBgColor,
                    color: textColor
                  }}
                />
              </Box>
            </Flex>
            <p style={{ fontSize: '12px', color: mutedColor, margin: '4px 0 0 0' }}>
              Select start and end dates for the week (typically Monday to Sunday)
            </p>
          </Box>
        );

      case 'hour':
        return (
          <Box>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: textColor }}>
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
                border: `1px solid ${inputBorderColor}`,
                borderRadius: '4px',
                backgroundColor: inputBgColor,
                color: textColor
              }}
            />
            <p style={{ fontSize: '12px', color: mutedColor, margin: '4px 0 0 0' }}>
              Select a time in 24-hour format
            </p>
          </Box>
        );

      case 'rating':
        return (
          <Box>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: textColor }}>
              Rating
            </label>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: `1px solid ${inputBorderColor}`,
                borderRadius: '4px',
                backgroundColor: inputBgColor,
                color: textColor,
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

      case 'world-clock':
        const timezones = [
          { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
          { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
          { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
          { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
          { value: 'America/Anchorage', label: 'Alaska' },
          { value: 'Pacific/Honolulu', label: 'Hawaii' },
          { value: 'America/Mexico_City', label: 'Mexico City' },
          { value: 'America/Bogota', label: 'Bogota, Lima' },
          { value: 'America/Buenos_Aires', label: 'Buenos Aires' },
          { value: 'America/Sao_Paulo', label: 'Brasilia, São Paulo' },
          { value: 'Europe/London', label: 'London, Dublin' },
          { value: 'Europe/Paris', label: 'Paris, Berlin, Rome' },
          { value: 'Europe/Madrid', label: 'Madrid' },
          { value: 'Europe/Moscow', label: 'Moscow, St. Petersburg' },
          { value: 'Africa/Cairo', label: 'Cairo' },
          { value: 'Africa/Johannesburg', label: 'Johannesburg' },
          { value: 'Asia/Dubai', label: 'Dubai, Abu Dhabi' },
          { value: 'Asia/Kolkata', label: 'Mumbai, New Delhi' },
          { value: 'Asia/Shanghai', label: 'Beijing, Shanghai' },
          { value: 'Asia/Tokyo', label: 'Tokyo, Osaka' },
          { value: 'Asia/Seoul', label: 'Seoul' },
          { value: 'Asia/Singapore', label: 'Singapore' },
          { value: 'Australia/Sydney', label: 'Sydney, Melbourne' },
          { value: 'Pacific/Auckland', label: 'Auckland, Wellington' },
          { value: 'UTC', label: 'UTC (Coordinated Universal Time)' }
        ];

        return (
          <Box>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: textColor }}>
              Select timezone
            </label>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: `1px solid ${inputBorderColor}`,
                borderRadius: '4px',
                backgroundColor: inputBgColor,
                color: textColor,
                cursor: 'pointer'
              }}
            >
              <option value="">-- Select a timezone --</option>
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </Box>
        );

      // Note: time_tracking is excluded from editable columns because
      // Monday.com API does not support updating time tracking columns

      case 'location':
        return (
          <Box>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: textColor }}>
              Address
            </label>
            <TextField
              placeholder="Enter address (e.g., New York, NY)"
              value={value}
              onChange={onChange}
              size={TextField.sizes.MEDIUM}
            />
            <p style={{ fontSize: '12px', color: mutedColor, margin: '4px 0 0 0' }}>
              Enter a text address (geocoding not included)
            </p>
          </Box>
        );

      case 'color':
      case 'color_picker':
        return (
          <Box>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: textColor }}>
              Select color
            </label>
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: '100%',
                height: '48px',
                padding: '4px',
                border: `1px solid ${inputBorderColor}`,
                borderRadius: '4px',
                backgroundColor: inputBgColor,
                cursor: 'pointer'
              }}
            />
            <p style={{ fontSize: '12px', color: mutedColor, margin: '4px 0 0 0' }}>
              Selected: {value || '#000000'}
            </p>
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
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: textColor }}>
            Select column to update
          </label>
          <select
            value={selectedColumn}
            onChange={(e) => onColumnChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '14px',
              border: `1px solid ${inputBorderColor}`,
              borderRadius: '4px',
              backgroundColor: inputBgColor,
              color: textColor,
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
            <Box style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '16px' }}>
              {renderValueInput()}
            </Box>

            <Box style={{ background: isDarkMode ? '#252846' : '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
              <p style={{ fontSize: '12px', color: mutedColor, margin: 0 }}>
                <strong style={{ color: textColor }}>Column type:</strong> {selectedColumnData.type}
              </p>
              <p style={{ fontSize: '12px', color: mutedColor, margin: '4px 0 0 0' }}>
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
