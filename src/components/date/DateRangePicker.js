import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from 'date-fns';

const DateRangePicker = ({ 
  dateRange, 
  setDateRange, 
  containerStyle 
}) => {
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);

  const showStartDatePicker = () => {
    setStartDatePickerVisible(true);
  };

  const hideStartDatePicker = () => {
    setStartDatePickerVisible(false);
  };

  const handleConfirmStartDate = (date) => {
    setDateRange(prev => ({ ...prev, start: date }));
    hideStartDatePicker();
  };

  const showEndDatePicker = () => {
    setEndDatePickerVisible(true);
  };

  const hideEndDatePicker = () => {
    setEndDatePickerVisible(false);
  };

  const handleConfirmEndDate = (date) => {
    setDateRange(prev => ({ ...prev, end: date }));
    hideEndDatePicker();
  };

  const clearDateRange = () => {
    setDateRange({ start: null, end: null });
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.dateRangeContainer}>
        <TouchableOpacity 
          style={styles.dateButton} 
          onPress={showStartDatePicker}
        >
          <Text style={styles.dateButtonLabel}>From:</Text>
          <Text style={styles.dateButtonText}>
            {dateRange.start ? format(dateRange.start, 'MMM d, yyyy') : 'Select start date'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.dateButton} 
          onPress={showEndDatePicker}
        >
          <Text style={styles.dateButtonLabel}>To:</Text>
          <Text style={styles.dateButtonText}>
            {dateRange.end ? format(dateRange.end, 'MMM d, yyyy') : 'Select end date'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {(dateRange.start || dateRange.end) && (
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={clearDateRange}
        >
          <Text style={styles.clearButtonText}>Clear dates</Text>
        </TouchableOpacity>
      )}
      
      <DateTimePickerModal
        isVisible={isStartDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmStartDate}
        onCancel={hideStartDatePicker}
        maximumDate={dateRange.end || new Date()}
      />
      
      <DateTimePickerModal
        isVisible={isEndDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmEndDate}
        onCancel={hideEndDatePicker}
        minimumDate={dateRange.start}
        maximumDate={new Date()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  dateButtonLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    marginTop: 8,
    padding: 8,
    alignSelf: 'flex-end',
  },
  clearButtonText: {
    color: '#FF3B30',
    fontSize: 14,
  },
});

export default DateRangePicker;