import React, {useState, useEffect} from 'react';
import {
  View,
  Modal,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import {HelperText, RadioButton, Snackbar} from 'react-native-paper';
import {isEmpty, find, trim} from 'lodash';

import {httpService} from '../http';

const CustomModal = props => {
  const {
    showModal,
    setShowModal,
    showError,
    setShowError,
    attendanceList,
    setStudentListUpdated,
  } = props;
  const defaultStudentDetails = {
    name: '',
    class: '',
    place: '',
    attendance: true,
  };
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [studentDetails, setStudentDetails] = useState(defaultStudentDetails);

  const onNameChange = text => {
    setStudentDetails({...studentDetails, name: text});
    const duplicate = find(attendanceList, ['name', trim(text.toLowerCase())]);
    if (duplicate) {
      setIsDuplicate(true);
    } else {
      setIsDuplicate(false);
    }
  };

  const onAddStudent = async () => {
    setIsFetching(true);
    const {status, response} = await httpService.post(
      '/add_student',
      studentDetails,
    );
    setIsFetching(false);
    if (status === 201 && response) {
      setStudentListUpdated(true);
      setStudentDetails(defaultStudentDetails);
      setShowModal(!showModal);
    } else {
      setShowError(true);
    }
  };

  useEffect(() => {
    if (
      isEmpty(studentDetails.name) ||
      isEmpty(studentDetails.class) ||
      isEmpty(studentDetails.place)
    ) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [studentDetails, setIsDisabled]);

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => {
          setShowModal(!showModal);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Student Details</Text>
            <TextInput
              style={styles.textbox}
              placeholder="Student Name*"
              placeholderTextColor="#000000"
              value={studentDetails.name}
              onChangeText={text => onNameChange(text)}
            />
            {isDuplicate && (
              <HelperText type="error" visible={isDuplicate}>
                Student with same name already exists
              </HelperText>
            )}
            <TextInput
              style={styles.textbox}
              placeholder="Student Class*"
              placeholderTextColor="#000000"
              keyboardType="numeric"
              value={studentDetails.class}
              onChangeText={text =>
                setStudentDetails({...studentDetails, class: text})
              }
            />
            <TextInput
              style={styles.textbox}
              placeholder="Student Place*"
              placeholderTextColor="#000000"
              value={studentDetails.place}
              onChangeText={text =>
                setStudentDetails({...studentDetails, place: text})
              }
            />
            <View style={styles.checkbox}>
              <Text>Is student press today?</Text>
              <RadioButton
                value="Yes"
                status={studentDetails.attendance ? 'checked' : 'unchecked'}
                onPress={() =>
                  setStudentDetails({
                    ...studentDetails,
                    attendance: true,
                  })
                }
              />
              <Text>Yes</Text>
              <RadioButton
                value="No"
                status={!studentDetails.attendance ? 'checked' : 'unchecked'}
                onPress={() =>
                  setStudentDetails({
                    ...studentDetails,
                    attendance: false,
                  })
                }
              />
              <Text>No</Text>
            </View>
            <HelperText type="error" visible={true}>
              * fields are mandatory
            </HelperText>
            {isFetching && <ActivityIndicator size="large" color="#0000ff" />}
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => {
                  setShowModal(!showModal);
                  setStudentDetails(defaultStudentDetails);
                }}>
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={
                  isDuplicate || isDisabled
                    ? [styles.button, styles.buttonDisabled]
                    : styles.button
                }
                disabled={isDuplicate || isDisabled}
                onPress={() => onAddStudent()}>
                <Text style={styles.textStyle}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Snackbar
          style={styles.errorSnackbarStyle}
          visible={showError}
          onDismiss={() => setShowError(false)}
          duration={3000}>
          Error while adding student
        </Snackbar>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 5,
    elevation: 2,
    margin: 5,
    height: 40,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: 'gray',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalTitle: {
    marginBottom: 15,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  textbox: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
    color: 'black',
    marginBottom: 10,
    padding: 10,
    width: 250,
  },
  checkbox: {
    alignItems: 'center',
    flexDirection: 'row',
    margin: 5,
  },
  errorSnackbarStyle: {
    backgroundColor: '#FF4C4C',
  },
});

export default CustomModal;
