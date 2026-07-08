import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { AddTaskModal } from '../src/components/AddTaskModal';
import type { Task } from '../src/types/Task';

const mockDateTimePicker = jest.fn(() => null);

jest.mock('@react-native-community/datetimepicker', () => {
  return (props: unknown) => {
    mockDateTimePicker(props);
    return null;
  };
});

jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');

function getLatestPickerProps(mode: 'date' | 'time') {
  return mockDateTimePicker.mock.calls
    .map(([props]) => props)
    .reverse()
    .find(props => props.mode === mode);
}

describe('AddTaskModal', () => {
  beforeEach(() => {
    mockDateTimePicker.mockClear();
  });

  it('only enables due time selection after a due date is chosen', async () => {
    const onSave = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <AddTaskModal visible initialTask={null} onClose={jest.fn()} onSave={onSave} />,
      );
    });

    const titleInput = renderer!.root.findByProps({placeholder: 'Task title'});
    await ReactTestRenderer.act(() => {
      titleInput.props.onChangeText('Plan sprint');
    });

    expect(renderer!.root.findByProps({testID: 'due-time-button'}).props.disabled).toBe(true);

    await ReactTestRenderer.act(() => {
      renderer!.root.findByProps({testID: 'due-date-button'}).props.onPress();
    });

    const datePickerProps = getLatestPickerProps('date');
    expect(datePickerProps).toBeDefined();

    await ReactTestRenderer.act(() => {
      datePickerProps.onChange({}, new Date('2026-07-08T12:00:00.000Z'));
    });

    expect(renderer!.root.findByProps({testID: 'due-time-button'}).props.disabled).toBe(false);
  });

  it('does not save a due time when the task has no due date', async () => {
    const onSave = jest.fn();
    const initialTask: Task = {
      id: 'task-1',
      title: 'Review backlog',
      dueTime: '09:30',
      category: 'Work',
      priority: 'Medium',
      completed: false,
      createdAt: 1,
    };
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <AddTaskModal visible initialTask={initialTask} onClose={jest.fn()} onSave={onSave} />,
      );
    });

    expect(renderer!.root.findByProps({testID: 'due-time-button'}).props.disabled).toBe(true);

    await ReactTestRenderer.act(() => {
      renderer!.root.findByProps({testID: 'save-task-button'}).props.onPress();
    });

    expect(onSave).toHaveBeenCalledWith({
      title: 'Review backlog',
      description: undefined,
      dueDate: undefined,
      dueTime: undefined,
      reminder: 0,
      category: 'Work',
      priority: 'Medium',
    });
  });
});
