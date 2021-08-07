/**
 * @format
 * @flow strict-local
 */

import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {BottomNavigation, Appbar, Divider} from 'react-native-paper';

import Attendance from './pages/Attendance';
import Report from './pages/Report';

const App = () => {
  const [index, setIndex] = React.useState(0);

  const [routes] = React.useState([
    {key: 'attendance', title: 'Attendance', icon: 'account-group'},
    {key: 'report', title: 'Reports', icon: 'text-box-multiple-outline'},
  ]);

  const renderScene = BottomNavigation.SceneMap({
    attendance: Attendance,
    report: Report,
  });

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="JDees Academy" />
      </Appbar.Header>
      <Divider style={styles.divider} />
      <BottomNavigation
        navigationState={{index, routes}}
        onIndexChange={setIndex}
        renderScene={renderScene}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
  divider: {
    height: 1,
  },
});

export default App;
