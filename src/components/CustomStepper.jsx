import React from 'react';
import { Flex, Box } from 'monday-ui-react-core';

/**
 * Stepper personalizado para navegación de pasos
 */
const CustomStepper = ({ steps, activeStepIndex }) => {
  return (
    <Flex gap={Flex.gaps.SMALL} align="Center" style={{ padding: '16px 0' }}>
      {steps.map((step, index) => {
        const isActive = index === activeStepIndex;
        const isCompleted = index < activeStepIndex;

        return (
          <React.Fragment key={index}>
            <Flex gap={Flex.gaps.SMALL} align="Center">
              {/* Número del paso */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isActive ? '#0073ea' : isCompleted ? '#00c875' : '#e0e0e0',
                  color: isActive || isCompleted ? '#fff' : '#666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                {isCompleted ? '✓' : index + 1}
              </div>

              {/* Título y subtítulo */}
              <Box>
                <div style={{
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#0073ea' : '#323338'
                }}>
                  {step.title}
                </div>
                {step.subtitle && (
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    marginTop: '2px'
                  }}>
                    {step.subtitle}
                  </div>
                )}
              </Box>
            </Flex>

            {/* Línea conectora */}
            {index < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  background: isCompleted ? '#00c875' : '#e0e0e0',
                  margin: '0 8px',
                  minWidth: '40px'
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </Flex>
  );
};

export default CustomStepper;
