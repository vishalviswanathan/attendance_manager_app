import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Searchbar,
  Portal,
  DataTable,
  Checkbox,
  Text,
  Snackbar,
  Headline,
  Subheading,
} from 'react-native-paper';
import moment from 'moment';
import {find, findIndex, filter, includes, isEmpty} from 'lodash';

import Icon from 'react-native-vector-icons/FontAwesome';

import CustomModal from '../components/Modal';
import {httpService} from '../http';

const Attendance = () => {
  const todayDate = moment().format('DD/MM/yy');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [allChecked, setAllChecked] = useState(false);
  const [showError, setShowError] = useState(false);
  const [studentListUpdated, setStudentListUpdated] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [completedUpdation, setCompletedUpdation] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [attendanceList, setAttendanceList] = useState([]);
  const [fullList, setFullList] = useState([]);

  const onChangeSearch = query => {
    setSearchQuery(query);
    if (isEmpty(query)) {
      setAttendanceList(fullList);
      const tempList = [...fullList];
      const unCheckedList = find(tempList, ['attendance', false]);
      setAllChecked(unCheckedList ? false : true);
    } else {
      const tempList = [...attendanceList];
      const searchResults = filter(tempList, student =>
        includes(student.name, query.toLowerCase()),
      );
      setAttendanceList(searchResults);
    }
  };

  const onAddButtonPress = () => setShowModal(true);

  const onAttendanceChange = student => {
    const tempList = [...attendanceList];
    const index = findIndex(tempList, ['_id', student._id]);
    tempList[index].attendance = !tempList[index].attendance;
    const unCheckedList = find(tempList, ['attendance', false]);
    setAllChecked(unCheckedList ? false : true);
    setAttendanceList(tempList);
  };

  const onAllCheckedPress = status => {
    const tempList = [...attendanceList];
    tempList.map(student => (student.attendance = status));
    setAttendanceList(tempList);
  };

  const getAttendanceList = useCallback(async () => {
    setIsFetching(true);
    const {status, response} = await httpService.get(
      '/get_students_attendance',
      {
        formatted_date: todayDate,
      },
    );
    setRefreshing(false);
    setIsFetching(false);
    if (status === 200 && response) {
      const unCheckedList = find(response.data.students, ['attendance', false]);
      if (unCheckedList || isEmpty(response.data.students)) {
        setAllChecked(false);
      } else {
        setAllChecked(true);
      }
      setAttendanceList(response.data.students);
      setFullList(response.data.students);
    } else {
      setAllChecked(false);
      setAttendanceList([]);
    }
  }, [todayDate]);

  const onAttendanceUpdate = async () => {
    setIsFetching(true);
    fullList.map(obj => attendanceList.find(o => o.id === obj.id) || obj);

    const {status} = await httpService.put('/update_attendance', {
      formatted_date: todayDate,
      students: fullList,
    });
    setIsFetching(false);
    if (status === 200) {
      setUpdateSuccess(true);
    } else {
      setUpdateSuccess(false);
    }
    setCompletedUpdation(true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    getAttendanceList();
  };

  useEffect(() => {
    getAttendanceList();
  }, [getAttendanceList]);

  useEffect(() => {
    if (studentListUpdated) {
      getAttendanceList();
    }
  }, [studentListUpdated, getAttendanceList]);

  return (
    <>
      <Headline style={styles.headlineStyle}>{'Date: ' + todayDate}</Headline>
      <Searchbar
        placeholder="Search by student name"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBarStyle}
      />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <DataTable>
          <DataTable.Header>
            <View style={styles.nameHeader}>
              <Text style={styles.textTile}>Students</Text>
            </View>
            <View style={styles.attendanceHeader}>
              <Text style={styles.textTile}>Attendance</Text>
              {
                <>
                  <Checkbox
                    status={allChecked ? 'checked' : 'unchecked'}
                    onPress={() => {
                      setAllChecked(!allChecked);
                      onAllCheckedPress(!allChecked);
                    }}
                  />
                  <Text>All</Text>
                </>
              }
            </View>
          </DataTable.Header>
          {isFetching && <ActivityIndicator size="large" color="#0000ff" />}
          {attendanceList.length > 0 &&
            attendanceList.map(student => (
              <DataTable.Row key={student._id}>
                <DataTable.Cell style={styles.tableCell}>
                  {student.name}
                </DataTable.Cell>
                <DataTable.Cell style={styles.tableCell}>
                  <Checkbox
                    status={student.attendance ? 'checked' : 'unchecked'}
                    onPress={() => {
                      onAttendanceChange(student);
                    }}
                  />
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          {!isFetching && attendanceList.length === 0 && (
            <Subheading style={styles.subheadingStyle}>
              No results found
            </Subheading>
          )}
        </DataTable>
      </ScrollView>
      {attendanceList.length > 0 && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => onAttendanceUpdate()}>
          <Text style={styles.textStyle}>Update</Text>
        </TouchableOpacity>
      )}
      <Portal>
        <CustomModal
          showModal={showModal}
          setShowModal={setShowModal}
          showError={showError}
          setShowError={setShowError}
          attendanceList={attendanceList}
          setStudentListUpdated={setStudentListUpdated}
        />
      </Portal>
      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddButtonPress}
        activeOpacity={0.4}>
        <Icon name="plus-circle" size={50} color="#2196F3" />
      </TouchableOpacity>
      <Snackbar
        style={
          updateSuccess
            ? styles.successSnackbarStyle
            : styles.errorSnackbarStyle
        }
        visible={completedUpdation}
        onDismiss={() => setCompletedUpdation(false)}
        duration={3000}>
        {updateSuccess ? 'Updated attendance' : 'Failed to update'}
      </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
  textTile: {
    fontSize: 15,
    fontWeight: '700',
  },
  headlineStyle: {
    color: '#16ba07',
    textAlign: 'center',
    padding: 5,
    fontWeight: '700',
  },
  searchBarStyle: {
    borderRadius: 20,
    margin: 5,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 10,
  },
  nameHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  selectAll: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  attendanceHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  tableCell: {
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 5,
    elevation: 2,
    margin: 5,
    height: 40,
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  successSnackbarStyle: {
    backgroundColor: '#4BB543',
  },
  errorSnackbarStyle: {
    backgroundColor: '#FF4C4C',
  },
  subheadingStyle: {
    padding: 20,
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
});

export default Attendance;
