import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const HospitalDetails = ({ hospital, onClose, currentLocation }) => {
  // Add error handling for coordinates
  const hospitalCoords = {
    latitude: parseFloat(hospital.geometry.location.lat),
    longitude: parseFloat(hospital.geometry.location.lng),
  };

  const region = {
    ...hospitalCoords,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.hospitalName}>{hospital.name}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.hospitalVicinity}>{hospital.vicinity}</Text>
        {hospital.rating && (
          <Text style={styles.hospitalRating}>
            Rating: {hospital.rating} ⭐ ({hospital.user_ratings_total} reviews)
          </Text>
        )}
        {hospital.opening_hours?.open_now !== undefined && (
          <Text style={styles.openStatus}>
            {hospital.opening_hours.open_now ? '🟢 Open' : '🔴 Closed'}
          </Text>
        )}
      </View>

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          zoomEnabled={true}
          scrollEnabled={true}
        >
          <Marker
            coordinate={hospitalCoords}
            title={hospital.name}
            description={hospital.vicinity}
          />
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="Your Location"
              pinColor="blue"
            />
          )}
        </MapView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 20,
  },
  closeButton: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: 30,
    height: 30,
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
  closeButtonText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  mapContainer: {
    flex: 1,
    margin: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  hospitalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    paddingRight: 10,
  },
  hospitalVicinity: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  hospitalRating: {
    fontSize: 16,
    color: '#f4c430',
    marginBottom: 8,
  },
  openStatus: {
    fontSize: 16,
    color: '#444',
  },
});

export default HospitalDetails;