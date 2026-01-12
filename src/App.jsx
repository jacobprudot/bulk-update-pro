import React, { useState, useEffect } from 'react';
import { useMonday } from './hooks/useMonday';
import { getBoardItems, getBoardColumns, bulkUpdateItems } from './services/mondayService';
import { formatColumnValue } from './utils/mondayHelpers';
import { Button, Loader, Heading, Flex, Box } from 'monday-ui-react-core';
import ItemSelector from './components/ItemSelector';
import ColumnSelector from './components/ColumnSelector';
import PreviewChanges from './components/PreviewChanges';
import CustomStepper from './components/CustomStepper';
import logoImg from './assets/logo.png';

function App() {
  const { monday, context, loading: sdkLoading } = useMonday();
  const [theme, setTheme] = useState('light');

  // Listen for theme changes from Monday.com
  useEffect(() => {
    if (monday) {
      monday.listen('context', (res) => {
        if (res.data.theme) {
          setTheme(res.data.theme);
        }
      });
      // Also get initial theme
      monday.get('context').then((res) => {
        if (res.data.theme) {
          setTheme(res.data.theme);
        }
      });
    }
  }, [monday]);

  // Apply theme class to body
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    if (theme === 'dark' || theme === 'black') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [theme]);

  const isDarkMode = theme === 'dark' || theme === 'black';

  // Data state
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [newValue, setNewValue] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Load board data
  useEffect(() => {
    if (context?.boardId) {
      loadBoardData();
    }
  }, [context]);

  const loadBoardData = async () => {
    setLoading(true);
    try {
      const [boardItems, boardColumns] = await Promise.all([
        getBoardItems(context.boardId),
        getBoardColumns(context.boardId)
      ]);

      setItems(boardItems);
      setColumns(boardColumns);
    } catch (error) {
      console.error('Error loading board data:', error);
      monday.execute('notice', {
        message: 'Error loading board data',
        type: 'error',
        timeout: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 0 && selectedItems.length === 0) {
      monday.execute('notice', {
        message: 'Please select at least one item',
        type: 'error',
        timeout: 3000
      });
      return;
    }

    if (currentStep === 1 && (!selectedColumn || !newValue)) {
      monday.execute('notice', {
        message: 'Please select a column and enter a value',
        type: 'error',
        timeout: 3000
      });
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleConfirmUpdate = async () => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const columnData = columns.find(col => col.id === selectedColumn);
      const formattedValue = formatColumnValue(columnData.type, newValue);

      // Create updates array
      const updates = selectedItems.map(itemId => ({
        itemId,
        columnId: selectedColumn,
        value: formattedValue
      }));

      // Execute bulk update with progress callback
      const results = await bulkUpdateItems(
        context.boardId,
        updates,
        (progressData) => setProgress(progressData.percentage)
      );

      // Show results
      if (results.failed.length === 0) {
        monday.execute('notice', {
          message: `${results.successful.length} item(s) updated successfully`,
          type: 'success',
          timeout: 5000
        });
      } else if (results.successful.length > 0) {
        monday.execute('notice', {
          message: `${results.successful.length} updated, ${results.failed.length} failed`,
          type: 'warning',
          timeout: 5000
        });
      } else {
        monday.execute('notice', {
          message: `Failed to update ${results.failed.length} item(s)`,
          type: 'error',
          timeout: 5000
        });
      }

      // Reset
      setSelectedItems([]);
      setSelectedColumn('');
      setNewValue('');
      setCurrentStep(0);
      setProgress(0);

      // Reload data
      await loadBoardData();

    } catch (error) {
      console.error('Error in bulk update:', error);
      monday.execute('notice', {
        message: error.message || 'Error updating items. Please try again.',
        type: 'error',
        timeout: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPreview = () => {
    setCurrentStep(1);
  };

  const steps = [
    { title: 'Select Items', subtitle: `${selectedItems.length} selected` },
    { title: 'Column & Value', subtitle: selectedColumn ? columns.find(c => c.id === selectedColumn)?.title : '' },
    { title: 'Confirm', subtitle: 'Review changes' }
  ];

  if (sdkLoading || loading) {
    return (
      <Flex justify="Center" align="Center" style={{ height: '100vh' }}>
        <Loader size={Loader.sizes.LARGE} />
      </Flex>
    );
  }

  if (!context?.boardId) {
    return (
      <Box padding={Box.paddings.LARGE}>
        <Heading type={Heading.types.H2} value="Error" />
        <p>This app must run inside a Monday.com board</p>
      </Box>
    );
  }

  // Theme-aware styles
  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: isDarkMode ? '#1c1f3b' : 'transparent',
    minHeight: '100vh'
  };

  const subtitleStyle = {
    color: isDarkMode ? '#9699a6' : '#666',
    margin: '8px 0 0 0'
  };

  const contentBoxStyle = {
    minHeight: '400px',
    background: isDarkMode ? '#30324e' : '#fff',
    borderRadius: '8px',
    border: isDarkMode ? '1px solid #4b4e69' : '1px solid #e0e0e0'
  };

  const progressBoxStyle = {
    background: isDarkMode ? '#30324e' : '#f5f5f5',
    padding: '16px',
    borderRadius: '8px'
  };

  const progressBarBgStyle = {
    width: '100%',
    background: isDarkMode ? '#4b4e69' : '#e0e0e0',
    height: '8px',
    borderRadius: '4px'
  };

  const textStyle = {
    color: isDarkMode ? '#ffffff' : '#323338'
  };

  const mutedTextStyle = {
    color: isDarkMode ? '#9699a6' : '#666'
  };

  return (
    <Box padding={Box.paddings.LARGE} style={containerStyle}>
      <Flex direction="Column" gap={Flex.gaps.LARGE}>
        {/* Header */}
        <Box>
          <Flex align="Center" gap={Flex.gaps.MEDIUM}>
            <img
              src={logoImg}
              alt="Bulk Update Pro"
              style={{
                width: '48px',
                height: '48px',
                objectFit: 'contain'
              }}
            />
            <Box>
              <Heading type={Heading.types.H1} value="Bulk Update Pro" />
              <p style={subtitleStyle}>
                Update multiple items quickly and easily
              </p>
            </Box>
          </Flex>
        </Box>

        {/* Stepper */}
        <CustomStepper
          steps={steps}
          activeStepIndex={currentStep}
          isDarkMode={isDarkMode}
        />

        {/* Step content */}
        <Box style={contentBoxStyle}>
          {currentStep === 0 && (
            <ItemSelector
              items={items}
              selectedItems={selectedItems}
              onSelectItems={setSelectedItems}
              loading={loading}
              isDarkMode={isDarkMode}
            />
          )}

          {currentStep === 1 && (
            <ColumnSelector
              columns={columns}
              selectedColumn={selectedColumn}
              value={newValue}
              onChange={setNewValue}
              onColumnChange={setSelectedColumn}
              boardId={context?.boardId}
              isDarkMode={isDarkMode}
            />
          )}

          {currentStep === 2 && (
            <PreviewChanges
              items={items}
              selectedItems={selectedItems}
              selectedColumn={selectedColumn}
              newValue={newValue}
              columns={columns}
              onConfirm={handleConfirmUpdate}
              onCancel={handleCancelPreview}
              isDarkMode={isDarkMode}
            />
          )}
        </Box>

        {/* Navigation */}
        {currentStep < 2 && (
          <Flex gap={Flex.gaps.MEDIUM} justify="SpaceBetween">
            <Button
              onClick={handleBack}
              disabled={currentStep === 0}
              kind={Button.kinds.TERTIARY}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              kind={Button.kinds.PRIMARY}
            >
              {currentStep === 1 ? 'Preview' : 'Next'}
            </Button>
          </Flex>
        )}

        {/* Progress during update */}
        {isProcessing && (
          <Box style={progressBoxStyle}>
            <Flex direction="Column" gap={Flex.gaps.SMALL}>
              <p style={{ margin: 0, fontWeight: 600, ...textStyle }}>Processing updates...</p>
              <div style={progressBarBgStyle}>
                <div
                  style={{
                    width: `${progress}%`,
                    background: '#0073ea',
                    height: '100%',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <p style={{ margin: 0, fontSize: '12px', ...mutedTextStyle }}>
                {Math.round(progress)}% complete
              </p>
            </Flex>
          </Box>
        )}
      </Flex>
    </Box>
  );
}

export default App;
