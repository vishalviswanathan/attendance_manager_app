import React, {useState, useEffect} from 'react';
import RNFS from 'react-native-fs';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  PermissionsAndroid,
} from 'react-native';
import {Text, Banner, Snackbar, IconButton} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Share from 'react-native-share';
import {httpService} from '../http';

const Report = () => {
  const [showDateModal, setShowDateModal] = useState(false);
  const [isFetchingStudents, setIsFetchingStudents] = useState(false);
  const [isFetchingAttendance, setIsFetchingAttendance] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const requestWritePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Attendance Manager Storage Permission',
          message: 'Attendance Manager needs permission to save excel data',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setHasPermission(true);
      } else {
        setHasPermission(false);
      }
    } catch (err) {
      setHasPermission(null);
    }
  };

  const saveToDownloads = async (data, filename) => {
    try {
      if (hasPermission) {
        const path = RNFS.DownloadDirectoryPath + `/${filename}.xlsx`;
        await RNFS.writeFile(path, data, 'base64');
        setShowBanner(true);
        setBannerMessage(`File ${filename}.xlsx saved to Downloads directory`);
      } else {
        setShowBanner(true);
        setBannerMessage('Storage permission is denied');
      }
    } catch (error) {
      setShowBanner(true);
      setBannerMessage(
        `Failed to save file ${filename}.xlsx in Downloads directory`,
      );
    }
  };

  const getStudentsData = async () => {
    setIsFetchingStudents(true);
    const {status, response} = await httpService.get('/get_students_excel');
    setIsFetchingStudents(false);
    if (status === 200) {
      saveToDownloads(response.data, 'students');
      Share.open({
        title: 'Students list',
        url: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${response.data}`,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        subject: 'Students List',
        showAppsToView: true,
        filename: 'students',
        saveToFiles: true,
      })
        .then(res => {})
        .catch(() => {});
    } else {
      setErrorMessage(response.message);
    }
  };

  const getAttendanceData = async currentDate => {
    const {status, response} = await httpService.get('/get_attendance_excel', {
      date: new Date(currentDate),
    });
    setIsFetchingAttendance(false);
    if (status === 200) {
      saveToDownloads(response.data, `${response.fileName}`);
      Share.open({
        title: 'Attendance list',
        url: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${response.data}`,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        subject: 'Students Attendance',
        showAppsToView: true,
        filename: `${response.fileName}`,
        saveToFiles: true,
      })
        .then(res => {})
        .catch(() => {});
    } else {
      setErrorMessage(response.message);
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShowDateModal(false);
    if (currentDate) {
      setIsFetchingAttendance(true);
      getAttendanceData(currentDate);
    }
  };

  useEffect(() => {
    requestWritePermission();
  }, []);

  return (
    <>
      {showBanner && (
        <Banner
          visible={showBanner}
          actions={[
            {
              label: 'Dismiss',
              onPress: () => setShowBanner(false),
            },
          ]}
          contentStyle={styles.bannerContentStyle}
          icon={props => {
            return (
              <IconButton
                icon="download-circle"
                color="#00a5ff"
                size={35}
                style={styles.iconButtonStyle}
              />
            );
          }}>
          <Text style={styles.bannerMessage}>{bannerMessage}</Text>
        </Banner>
      )}

      <View style={styles.viewStyle}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => getStudentsData()}>
          <Text style={styles.textStyle}>Download and share Students List</Text>
          {isFetchingStudents && (
            <ActivityIndicator size="small" color="#fff" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowDateModal(true)}>
          <Text style={styles.textStyle}>
            Download and share Attendance List
          </Text>
          {isFetchingAttendance && (
            <ActivityIndicator size="small" color="#fff" />
          )}
        </TouchableOpacity>
        {showDateModal && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            is24Hour={true}
            display="calendar"
            onChange={onDateChange}
          />
        )}
      </View>

      <Snackbar
        style={styles.errorSnackbarStyle}
        visible={!!errorMessage}
        onDismiss={() => setErrorMessage(null)}
        duration={3000}>
        {errorMessage}
      </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
  viewStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 5,
    elevation: 2,
    margin: 15,
    height: 40,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 10,
  },
  bannerMessage: {
    fontSize: 16,
    fontWeight: '400',
    color: '#ffffff',
  },
  errorSnackbarStyle: {
    backgroundColor: '#FF4C4C',
  },
  iconButtonStyle: {
    margin: 0,
  },
  bannerContentStyle: {
    backgroundColor: '#505353',
  },
});

export default Report;
