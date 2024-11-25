// new model for map
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import HospitalDetails from './HospitalDetails';
import { GOMAPS_PRO_API_KEY } from '@env';

const Home = () => {
  const [region, setRegion] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorLogs, setErrorLogs] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;
  const [isCancelled, setIsCancelled] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showLocationMap, setShowLocationMap] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logEntry);
    if (type === 'error') {
      setErrorLogs(prev => [...prev, logEntry]);
      Alert.alert('Error Occurred', message);
    }
  };

  const requestLocationPermission = async () => {
    try {
      addLog('Requesting location permission');
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          addLog('Location permission granted');
          getCurrentLocation();
        } else {
          addLog('Location permission denied', 'error');
          Alert.alert('Permission Denied', 'Location permission is required to find nearby hospitals');
        }
      } else {
        addLog('iOS device detected, proceeding with location request');
        getCurrentLocation();
      }
    } catch (err) {
      addLog(`Permission request failed: ${err.message}`, 'error');
      Alert.alert('Error', 'Failed to request location permission');
    }
  };

  const attemptGetLocation = () => {
    setAttempts(prev => prev + 1);
    getCurrentLocation();
  };

  const cancelLocationRequest = () => {
    setIsCancelled(true);
    setLoading(false);
    setAttempts(0);
    addLog('Location request cancelled by user');
  };

  const getCurrentLocation = () => {
    setIsCancelled(false);
    setLoading(true);
    addLog(`Attempting to get current location (Attempt ${attempts + 1}/${maxAttempts})`);

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        addLog(`Successfully got location: ${latitude}, ${longitude}`);

        const newRegion = {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };
        setRegion(newRegion);
        setCurrentLocation({
          latitude,
          longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          timestamp: new Date(position.timestamp).toLocaleString(),
        });
        setAttempts(0);
        setLoading(false);
      },
      (error) => {
        addLog(`Location error: ${error.message}`, 'error');

        if (!isCancelled && attempts < maxAttempts - 1) {
          addLog(`Retrying location fetch (attempt ${attempts + 1}/${maxAttempts})`);
          setTimeout(attemptGetLocation, 2000);
        } else {
          setAttempts(0);
          addLog('Failed to get current location after max attempts', 'error');
          Alert.alert('Error', 'Failed to get current location');
          setLoading(false);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    );
  };

  const fetchNearbyHospitals = async () => {
    if (!region) {
      addLog('Attempted to fetch hospitals without location', 'error');
      Alert.alert('Error', 'Please get your current location first');
      return;
    }

    setLoading(true);
    addLog('Starting nearby hospitals search');

    try {
      const url = `https://maps.gomaps.pro/maps/api/place/nearbysearch/json?location=${region.latitude},${region.longitude}&radius=5000&type=hospital&key=${GOMAPS_PRO_API_KEY}`;

      addLog(`Fetching from API: ${url.replace(GOMAPS_PRO_API_KEY, 'API_KEY_HIDDEN')}`);

      const response = await fetch(url);
      addLog(`API Response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      addLog(`API Response received: ${data.status}`);
    //  console.log(data);

      if (data.status === 'REQUEST_DENIED') {
        throw new Error('API key is invalid or expired');
      }

      const validHospitals = data.results?.filter(hospital =>
        hospital.geometry?.location?.lat &&
        hospital.geometry?.location?.lng
      ) || [];

      addLog(`Found ${validHospitals.length} valid hospitals`);
      setHospitals(validHospitals);
    } catch (error) {
      addLog(`Hospital fetch error: ${error.message}`, 'error');
      Alert.alert('Error', 'Failed to fetch nearby hospitals');
    } finally {
      setLoading(false);
    }
  };

  const HospitalCard = ({ hospital }) => (
    <TouchableOpacity
      style={styles.hospitalCard}
      onPress={() => setSelectedHospital(hospital)}
    >
      <Text style={styles.hospitalName}>{hospital.name}</Text>
      <Text style={styles.hospitalVicinity}>{hospital.vicinity}</Text>
      {hospital.rating && (
        <Text style={styles.hospitalRating}>Rating: {hospital.rating} ⭐ ({hospital.user_ratings_total} reviews)</Text>
      )}
      {hospital.opening_hours?.open_now !== undefined && (
        <Text style={styles.openStatus}>
          {hospital.opening_hours.open_now ? '🟢 Open' : '🔴 Closed'}
        </Text>
      )}
    </TouchableOpacity>
  );

  const LocationCard = ({ location }) => (
    <TouchableOpacity
      style={styles.locationCard}
      onPress={() => setShowLocationMap(true)}
    >
      <Text style={styles.cardHeader}>Your Current Location</Text>
      <View style={styles.locationDetail}>
        <Text style={styles.label}>Latitude:</Text>
        <Text style={styles.value}>{location.latitude.toFixed(6)}°</Text>
      </View>
      <View style={styles.locationDetail}>
        <Text style={styles.label}>Longitude:</Text>
        <Text style={styles.value}>{location.longitude.toFixed(6)}°</Text>
      </View>
      {location.accuracy && (
        <View style={styles.locationDetail}>
          <Text style={styles.label}>Accuracy:</Text>
          <Text style={styles.value}>{location.accuracy.toFixed(2)} meters</Text>
        </View>
      )}
      {location.altitude && (
        <View style={styles.locationDetail}>
          <Text style={styles.label}>Altitude:</Text>
          <Text style={styles.value}>{location.altitude.toFixed(2)} meters</Text>
        </View>
      )}
      <View style={styles.locationDetail}>
        <Text style={styles.label}>Last Updated:</Text>
        <Text style={styles.value}>{location.timestamp}</Text>
      </View>
    </TouchableOpacity>
  );

  const LocationMapView = ({ location, onClose }) => {
    const mapRef = React.useRef(null);

    const focusCurrentLocation = () => {
      mapRef.current?.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    };

    return (
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Your Current Location</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              showsUserLocation={true}
              showsCompass={true}
              zoomEnabled={true}
              scrollEnabled={true}
            >
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="Your Location"
              />
            </MapView>
          </View>

          <View style={styles.locationDetailsContainer}>
            <View style={styles.locationDetail}>
              <Text style={styles.label}>Latitude:</Text>
              <Text style={styles.value}>{location.latitude.toFixed(6)}°</Text>
            </View>
            <View style={styles.locationDetail}>
              <Text style={styles.label}>Longitude:</Text>
              <Text style={styles.value}>{location.longitude.toFixed(6)}°</Text>
            </View>
            {location.accuracy && (
              <View style={styles.locationDetail}>
                <Text style={styles.label}>Accuracy:</Text>
                <Text style={styles.value}>{location.accuracy.toFixed(2)} meters</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={requestLocationPermission}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Get Current Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !region && styles.buttonDisabled]}
          onPress={fetchNearbyHospitals}
          disabled={!region || loading}
        >
          <Text style={styles.buttonText}>Find Nearby Hospitals</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {currentLocation && <LocationCard location={currentLocation} />}

        {hospitals.length > 0 && (
          <View style={styles.hospitalList}>
            <Text style={styles.resultsHeader}>Found {hospitals.length} Hospitals Nearby</Text>
            {hospitals.map((hospital, index) => (
              <HospitalCard key={hospital.place_id || index} hospital={hospital} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Updated Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>
              {attempts > 0
                ? `Retrying... (${attempts}/${maxAttempts})`
                : 'Getting location...'}
            </Text>
            {attempts > 0 && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelLocationRequest}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {selectedHospital && (
        <HospitalDetails
          hospital={selectedHospital}
          onClose={() => setSelectedHospital(null)}
          currentLocation={currentLocation}
        />
      )}

      {showLocationMap && currentLocation && (
        <LocationMapView
          location={currentLocation}
          onClose={() => setShowLocationMap(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  buttonContainer: {
    padding: 15,
    gap: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    maxHeight: 200,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 5,
  },
  errorText: {
    color: '#c62828',
    fontSize: 12,
    marginBottom: 3,
  },
  loadingText: {
    marginTop: 12,
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  hospitalList: {
    flex: 1,
    padding: 15,
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  hospitalCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  hospitalVicinity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  hospitalRating: {
    fontSize: 14,
    color: '#f4c430',
    marginBottom: 5,
  },
  openStatus: {
    fontSize: 14,
    color: '#444',
  },
  noResults: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  locationCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  locationDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 200,
    alignItems: 'center',
  },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#ff3b30',
    borderRadius: 6,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    height: '70%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    margin: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  locationDetailsContainer: {
    padding: 20,
  },
  focusButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: 'white',
    borderRadius: 30,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  focusButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusButtonIcon: {
    fontSize: 24,
  },
});

export default Home;