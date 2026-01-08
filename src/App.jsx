import React, { useState, useEffect } from 'react';
import { useMonday } from './hooks/useMonday';
import { getBoardItems, getBoardColumns, bulkUpdateItems } from './services/mondayService';
import { formatColumnValue } from '../../shared/utils/mondayHelpers';
import { Button, Loader, Heading, Flex, Box } from 'monday-ui-react-core';
import ItemSelector from './components/ItemSelector';
import ColumnSelector from './components/ColumnSelector';
import PreviewChanges from './components/PreviewChanges';
import CustomStepper from './components/CustomStepper';

function App() {
  const { monday, context, loading: sdkLoading } = useMonday();

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

      // Update in batches to show progress
      const batchSize = 10;
      const batches = [];

      for (let i = 0; i < updates.length; i += batchSize) {
        batches.push(updates.slice(i, i + batchSize));
      }

      for (let i = 0; i < batches.length; i++) {
        await bulkUpdateItems(context.boardId, batches[i]);
        setProgress(((i + 1) / batches.length) * 100);
      }

      monday.execute('notice', {
        message: `${selectedItems.length} item(s) updated successfully`,
        type: 'success',
        timeout: 5000
      });

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
        message: 'Error updating items. Please try again.',
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

  return (
    <Box padding={Box.paddings.LARGE} style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Flex direction="Column" gap={Flex.gaps.LARGE}>
        {/* Header */}
        <Box>
          <Heading type={Heading.types.H1} value="Bulk Update Pro" />
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>
            Update multiple items quickly and easily
          </p>
        </Box>

        {/* Stepper */}
        <CustomStepper
          steps={steps}
          activeStepIndex={currentStep}
        />

        {/* Step content */}
        <Box style={{ minHeight: '400px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          {currentStep === 0 && (
            <ItemSelector
              items={items}
              selectedItems={selectedItems}
              onSelectItems={setSelectedItems}
              loading={loading}
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
          <Box style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
            <Flex direction="Column" gap={Flex.gaps.SMALL}>
              <p style={{ margin: 0, fontWeight: 600 }}>Processing updates...</p>
              <div style={{ width: '100%', background: '#e0e0e0', height: '8px', borderRadius: '4px' }}>
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
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
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
