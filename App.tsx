/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  Header,
} from 'react-native/Libraries/NewAppScreen';

import remoteConfig from '@react-native-firebase/remote-config';

const CURRENT_VERSION = "1.3.5";

function App(): React.JSX.Element {

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [requiresForceUpdate, setRequiresForceUpdate] = useState<boolean | undefined>(false);
  const [requiresOptionalUpdate, setRequiresOptionalUpdate] = useState<boolean | undefined>(false);

  useEffect(() => {

    remoteConfig().onConfigUpdated(_listener => {
      let updatedKeys = _listener?.updatedKeys || [];
      console.log("updatedKeys", updatedKeys);

      updatedKeys.forEach(key => {
        if (key === "update_versions") {
          console.log("fetching new updated key")
          remoteConfig().activate()
          .then(val => {
            const updates = remoteConfig().getValue('update_versions');
            shouldPopUpdate(updates.asString());
          })
          .catch(err => console.log("err", err));
        }
      })

    })

    remoteConfig()
      .setDefaults({
        update_versions: "{\"force_updates\":[],\"optional_updates\":[]}",
      })
      .then(fetchAndActivate);

    const updates = remoteConfig().getValue('update_versions');
    shouldPopUpdate(updates.asString());
  }, []);

  function fetchAndActivate() {
    remoteConfig().fetchAndActivate()
      .then(fetchedRemotely => {
        if (fetchedRemotely) {
          console.log('Configs were retrieved from the backend and activated.');

        } else {
          console.log(
            'No configs were fetched from the backend, and the local configs were already activated',
          );
          const updates = remoteConfig().getValue('update_versions');
          shouldPopUpdate(updates.asString());
        }
      });
  }

  function shouldPopUpdate(updates: string) {
    if (updates) {
      let data = JSON.parse(updates);

      let forceUpdates = data?.force_updates;
      let optionalUpdates = data?.optional_updates;

      console.log({
        forceUpdates, optionalUpdates
      });

      if (forceUpdates || optionalUpdates) {

        if (Array.isArray(forceUpdates) && forceUpdates.length && forceUpdates.includes(CURRENT_VERSION)) {
          setRequiresForceUpdate(true)
        } else if (Array.isArray(optionalUpdates) && optionalUpdates.length && optionalUpdates.includes(CURRENT_VERSION)) {
          setRequiresOptionalUpdate(true)
        } else {
          setRequiresForceUpdate(false);
          setRequiresOptionalUpdate(false);
        }
      }
    }
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            flex: 1, justifyContent: "center", alignItems: "center",
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Text>Hello CIBIL!</Text>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={requiresForceUpdate || requiresOptionalUpdate}
          onRequestClose={() => {
            setRequiresForceUpdate(undefined);
            setRequiresOptionalUpdate(undefined);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>
                {`Requires ${requiresForceUpdate ? 'a Force' : 'an Optional'} update for version ${CURRENT_VERSION}`}
              </Text>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => {
                  setRequiresForceUpdate(false);
                  setRequiresOptionalUpdate(false);
                }}>
                <Text style={styles.textStyle}>Hide Modal</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
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
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default App;
