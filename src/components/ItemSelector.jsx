import React, { useMemo } from 'react';
import { Box, Heading, Checkbox, Flex, Search, Loader, Dropdown, Button, Icon } from 'monday-ui-react-core';
import { useDebounce } from '../hooks/useDebounce';

/**
 * Component for selecting board items
 */
const ItemSelector = ({ items, selectedItems, onSelectItems, loading }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterColumn, setFilterColumn] = React.useState('');
  const [filterValue, setFilterValue] = React.useState('');
  const [sortBy, setSortBy] = React.useState('name');

  // Apply debounce to search
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Get all columns that can be used for filtering (status, dropdown, people, etc.)
  const availableColumns = useMemo(() => {
    if (items.length === 0) return [];

    const firstItem = items[0];
    return firstItem.column_values
      ?.filter(col => ['status', 'dropdown', 'people', 'multiple-person', 'text'].includes(col.type))
      .map(col => ({
        value: col.id,
        label: col.title || col.id,
        type: col.type
      })) || [];
  }, [items]);

  // Get unique values for the selected filter column
  const availableFilterValues = useMemo(() => {
    if (!filterColumn || items.length === 0) return [];

    const uniqueValues = new Set();
    items.forEach(item => {
      const column = item.column_values?.find(col => col.id === filterColumn);
      if (column && column.text) {
        uniqueValues.add(column.text);
      }
    });

    return Array.from(uniqueValues).sort().map(val => ({
      value: val,
      label: val
    }));
  }, [items, filterColumn]);

  // Filter and sort items (memoized for performance)
  const filteredItems = useMemo(() => {
    let result = items;

    // Search by name
    if (debouncedSearch) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Filter by column (exact match)
    if (filterColumn && filterValue) {
      result = result.filter(item => {
        const column = item.column_values?.find(col => col.id === filterColumn);
        return column?.text === filterValue;
      });
    }

    // Sort
    if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [items, debouncedSearch, filterColumn, filterValue, sortBy]);

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectItems(filteredItems.map(item => item.id));
    } else {
      onSelectItems([]);
    }
  };

  const handleSelectItem = (itemId, checked) => {
    if (checked) {
      onSelectItems([...selectedItems, itemId]);
    } else {
      onSelectItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterColumn('');
    setFilterValue('');
  };

  const allSelected = filteredItems.length > 0 &&
    filteredItems.every(item => selectedItems.includes(item.id));

  const hasFilters = searchTerm || filterColumn || filterValue;

  if (loading) {
    return (
      <Box padding={Box.paddings.MEDIUM}>
        <Flex justify="Center" align="Center" style={{ minHeight: '200px' }}>
          <Loader />
        </Flex>
      </Box>
    );
  }

  return (
    <Box padding={Box.paddings.MEDIUM}>
      <Flex direction="Column" gap={Flex.gaps.MEDIUM}>
        <Flex justify="SpaceBetween" align="Center">
          <Heading type={Heading.types.H3} value="Select Items" />
          {items.length > 0 && (
            <span style={{ fontSize: '14px', color: '#666' }}>
              Total: {items.length} items
            </span>
          )}
        </Flex>

        {/* Search */}
        <Search
          placeholder="Search by name..."
          value={searchTerm}
          onChange={setSearchTerm}
          size={Search.sizes.MEDIUM}
        />

        {/* Advanced filters (optional) */}
        {availableColumns.length > 0 && (
          <Flex gap={Flex.gaps.SMALL} align="Center">
            <select
              value={filterColumn}
              onChange={(e) => setFilterColumn(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: '13px',
                border: '1px solid #c5c7d0',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                minWidth: '150px'
              }}
            >
              <option value="">Filter by column</option>
              {availableColumns.map(col => (
                <option key={col.value} value={col.value}>
                  {col.label}
                </option>
              ))}
            </select>
            {filterColumn && availableFilterValues.length > 0 && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                style={{
                  padding: '6px 10px',
                  fontSize: '13px',
                  border: '1px solid #c5c7d0',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  minWidth: '150px'
                }}
              >
                <option value="">-- Select value --</option>
                {availableFilterValues.map(val => (
                  <option key={val.value} value={val.value}>
                    {val.label}
                  </option>
                ))}
              </select>
            )}
            {hasFilters && (
              <Button
                size={Button.sizes.SMALL}
                kind={Button.kinds.TERTIARY}
                onClick={handleClearFilters}
              >
                Clear filters
              </Button>
            )}
          </Flex>
        )}

        {/* Items list */}
        <Flex direction="Column" gap={Flex.gaps.SMALL} style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <Checkbox
            label={`Select all (${filteredItems.length})`}
            checked={allSelected}
            onChange={handleSelectAll}
          />

          <Box style={{ borderTop: '1px solid #e0e0e0', paddingTop: '8px' }} />

          {filteredItems.map(item => (
            <Checkbox
              key={item.id}
              label={item.name}
              checked={selectedItems.includes(item.id)}
              onChange={(checked) => handleSelectItem(item.id, checked)}
            />
          ))}

          {filteredItems.length === 0 && (
            <Box padding={Box.paddings.MEDIUM}>
              <p style={{ color: '#666', textAlign: 'center' }}>
                {hasFilters
                  ? 'No items found with applied filters'
                  : 'No items in this board'}
              </p>
            </Box>
          )}
        </Flex>

        {/* Footer with counter */}
        <Flex justify="SpaceBetween" align="Center" style={{ borderTop: '1px solid #e0e0e0', paddingTop: '8px' }}>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            <strong>{selectedItems.length}</strong> of {filteredItems.length} selected
          </p>
          {selectedItems.length > 50 && (
            <p style={{ fontSize: '12px', color: '#ff9800', margin: 0 }}>
              ⚠️ Bulk update ({selectedItems.length} items)
            </p>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default ItemSelector;
