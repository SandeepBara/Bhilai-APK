// screens/SubmitSummaryScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import HeaderNavigation from '../../../Components/HeaderNavigation';
import axios from 'axios';
import {
  SAF_SUBMIT_FIELD_VERIFICATION_API,
  PROPERTY_GEOTAG_IMAGE_API,
  SAF_POST_NEXT_API,
} from '../../../api/apiRoutes';
import { getToken, getUserDetails } from '../../../utils/auth';
import { useNavigation } from '@react-navigation/native';
import { showToast } from '../../../utils/toast';
import moment from 'moment';
import ImageResizer from 'react-native-image-resizer';
import { CopyableTouchableOpacity } from '../../../Components/CopyableControl';
import { cardHeader } from '../../../style/cardHeader';
import { uiStyles } from '../../../style/theme';

const Card = ({ title, children }) => (
  <View style={styles.card}>
    {title && <Text selectable style={styles.cardTitle}>{title}</Text>}
    {children}
  </View>
);

const SubmitVarification = ({ route }) => {
  const navigation = useNavigation();
  const { submissionData, location, left, right, front, id, data, floorIds } =
    route.params;
  console.log('submission data', submissionData);
  console.log('submission data', floorIds);
  console.log('Submission dta dtya', data);

  const [showModal, setShowModal] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [isULBUser, setIsULBUser] = useState(false);

  const photos = [
    { label: 'left side', direction: 'West', ...left },
    { label: 'right side', direction: 'East', ...right },
    { label: 'front side', direction: 'North', ...front },
  ];
  // Detect if the user is a ULB user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUserDetails();
        if (user?.userFor === 'ULB') setIsULBUser(true);
      } catch (err) {
        console.log('Error fetching user:', err);
      }
    };
    fetchUser();
  }, []);

  const convertMonthYear = str => {
    if (!str) return null;
    const months = {
      january: '01',
      february: '02',
      march: '03',
      april: '04',
      may: '05',
      june: '06',
      july: '07',
      august: '08',
      september: '09',
      october: '10',
      november: '11',
      december: '12',
    };
    const [monthName, year] = str.split(' ');
    const month = months[monthName.toLowerCase()];
    return month && year ? `${year}-${month}` : null;
  };
  const formatDateForAPI = date => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const handleSubmit = async () => {
    const token = await getToken();
    try {
      const finalFloors =
        (submissionData?.extraFloors?.length > 0
          ? submissionData.extraFloors.map(floor => ({
              safFloorDetailId: floor.safFloorDetailId || 0,
              builtupArea: Number(floor.builtupArea ?? 0),
              dateFrom: convertMonthYear(floor.dateFrom),
              dateUpto: convertMonthYear(floor.dateUpto),
              floorMasterId: floor.floorMasterId
                ? String(floor.floorMasterId)
                : null,
              usageTypeMasterId: floor.usageTypeMasterId
                ? String(floor.usageTypeMasterId)
                : null,
              constructionTypeMasterId: floor.constructionTypeMasterId
                ? String(floor.constructionTypeMasterId)
                : null,
              occupancyTypeMasterId: floor.occupancyTypeMasterId
                ? String(floor.occupancyTypeMasterId)
                : null,
            }))
          : floorIds?.map(floor => ({
              safFloorDetailId: floor.id,
              builtupArea: Number(floor.builtupArea ?? 0),
              carpetArea: Number(floor.carpetArea ?? 0),
              dateFrom: floor.dateFrom,
              dateUpto: floor.dateUpto,
              floorMasterId: floor.floorMasterId
                ? String(floor.floorMasterId)
                : null,
              usageTypeMasterId: floor.usageTypeMasterId
                ? String(floor.usageTypeMasterId)
                : null,
              constructionTypeMasterId: floor.constructionTypeMasterId
                ? String(floor.constructionTypeMasterId)
                : null,
              occupancyTypeMasterId: floor.occupancyTypeMasterId
                ? String(floor.occupancyTypeMasterId)
                : null,
              floorName: floor.floorName || null,
              usageType: floor.usageType || null,
              occupancyName: floor.occupancyName || null,
              constructionType: floor.constructionType || null,
            }))) || [];

      const fieldPayload = {
        // Mobile Tower
        percentageOfPropertyTransfer:
          submissionData?.percentageOfPropertyTransfer,
        appartmentDetailsId: submissionData?.apartmentDetail,

        isMobileTower: submissionData?.isMobileTower === true, // ensure boolean
        towerArea: submissionData?.isMobileTower
          ? parseFloat(submissionData?.towerArea) || 0
          : null,
        towerInstallationDate:
          submissionData?.isMobileTower && submissionData?.installationDate
            ? moment(submissionData.installationDate).format('YYYY-MM-DD')
            : null,

        // ✅ Hoarding
        isHoardingBoard: submissionData?.isHoardingBoard === true,
        hoardingArea: submissionData?.isHoardingBoard
          ? parseFloat(submissionData?.hoardingArea) || 0
          : null,
        // Backend requires YYYY-MM-DD for validation
        hoardingInstallationDate: submissionData.isHoardingBoard
          ? formatDateForAPI(submissionData.hoardingInstallationDate)
          : null,
        hoardingInstallationDateTime: submissionData.isHoardingBoard
          ? submissionData.hoardingInstallationDate
          : null,

        // ✅ Petrol Pump
        isPetrolPump: submissionData?.isPetrolPump === true,
        pumpArea: submissionData?.isPetrolPump
          ? parseFloat(submissionData?.pumpArea) || 0
          : null,
        pumpInstallationDate:
          submissionData?.isPetrolPump && submissionData?.pumpInstallationDate
            ? moment(submissionData.pumpInstallationDate).format('YYYY-MM-DD')
            : null,
        underGroundArea: submissionData?.isPetrolPump
          ? parseFloat(submissionData?.underGroundArea) || 0.1
          : null,
        petrolPumpCompletionDate:
          submissionData?.isPetrolPump && submissionData?.pumpInstallationDate
            ? moment(submissionData.pumpInstallationDate).format('YYYY-MM-DD')
            : null,

        // ✅ Rainwater Harvesting
        isWaterHarvesting: submissionData?.isWaterHarvesting === true,
        waterHarvestingDate:
          submissionData?.isWaterHarvesting && submissionData?.completionDate
            ? moment(submissionData.completionDate).format('YYYY-MM-DD')
            : null,
        safDetailId: id,
        wardMstrId: submissionData?.wardMstrId,
        newWardMstrId: submissionData?.newWardMstrId,
        builtupArea: submissionData?.builtupArea,

        propTypeMstrId:
          submissionData?.propTypeMstrId || submissionData?.propertyTypeId,
        zoneMstrId: submissionData?.zoneMstrId,
        roadWidth: submissionData?.roadWidth,
        areaOfPlot: submissionData?.areaOfPlot,
        landOccupationDate:
          submissionData?.['Property Type (Current)'] === 'VACANT LAND' ||
          submissionData?.Verified_PropertyType === 'VACANT LAND'
            ? data?.landOccupationDate || new Date().toISOString().split('T')[0]
            : null,
        floorDtl: finalFloors,
      };
      console.log('fieldPayload', JSON.stringify(fieldPayload, null, 2));
      const response = await axios.post(
        SAF_SUBMIT_FIELD_VERIFICATION_API,
        fieldPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          timeout: 15000,
        },
      );
      // console.log(response.data);

      if (response.status === 200) {
        // or any condition for success
        showToast('success', response.data.message); // show success toast
        setShowModal(true); // open the modal
      }
    } catch (error) {
      console.error('Submission Error:', error.response?.data || error.message);
      Alert.alert('Error', 'Submission failed. Please try again.');
    }

    const resizedPhotos = await Promise.all(
      photos.map(async (photo, index) => {
        if (!photo?.uri) return null;
        const resized = await ImageResizer.createResizedImage(
          photo.uri,
          1024,
          1024,
          'JPEG',
          80,
        );
        return {
          ...photo,
          uri: resized.uri,
          fileName: photo.fileName || `${photo.label.replace(' ', '_')}.jpg`,
        };
      }),
    );

    // 5️⃣ Build FormData
    const formData = new FormData();
    formData.append('id', id);

    const geoTagArray = resizedPhotos.map((photo, index) => ({
      latitude: location.latitude,
      longitude: location.longitude,
      direction: photo.label,
      label: photo.label,
      document: photo,
    }));

    // Ensure at least 3 items
    while (geoTagArray.length < 3) {
      geoTagArray.push({
        latitude: location.latitude,
        longitude: location.longitude,
        direction: 'N',
        label: `extra-${geoTagArray.length + 1}`,
        document: resizedPhotos[0] || null,
      });
    }

    // Append geoTag with files
    geoTagArray.forEach((item, index) => {
      if (!item.document) return;
      formData.append(`geoTag[${index}][latitude]`, item.latitude);
      formData.append(`geoTag[${index}][longitude]`, item.longitude);
      formData.append(`geoTag[${index}][direction]`, item.direction);
      formData.append(`geoTag[${index}][label]`, item.label);
      formData.append(`geoTag[${index}][document]`, {
        uri: item.document.uri,
        type: item.document.type || 'image/jpeg',
        name: item.document.fileName,
      });
    });

    // If backend still expects plain `images`
    resizedPhotos.forEach(photo => {
      if (!photo) return;
      formData.append('images', {
        uri: photo.uri,
        type: photo.type || 'image/jpeg',
        name: photo.fileName,
      });
    });

    // 6️⃣ Submit
    try {
      const geoRes = await axios.post(
        PROPERTY_GEOTAG_IMAGE_API,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          timeout: 20000,
        },
      );

      // ✅ Full response log
      console.log('GeoTagging Response:', geoRes);

      // ✅ If you only want the data
      console.log('GeoTagging Response Data:', geoRes.data);

      Alert.alert('Success', 'Data & Images submitted successfully!');
    } catch (error) {
      console.error('Submission Error:', error.response?.data || error.message);
      Alert.alert('Error', 'Submission failed. Please try again.');
    }
  };

  const handleSendToLevel = async status => {
    try {
      const token = await getToken();
      const payload = {
        id: id,
        remarks: remarks,
        status: status, // 'FORWARD' or 'BACKWARD'
      };

      await axios.post(SAF_POST_NEXT_API, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowModal(false);

      navigation.navigate('FieldVarification', {
        submissionData,
        location,
        photos,
        remarks,
        id,
      });
    } catch (err) {
      console.error('Send to Level Error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to send to level.');
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <HeaderNavigation />
        <Text selectable style={styles.title}>Submitted Data</Text>

        {/* Property Details */}
        <Card title="Property Details">
          <Text selectable>
            <Text style={{ fontWeight: 'bold' }}>Ward No:</Text>{' '}
            {submissionData?.['Ward No']}
          </Text>
          <Text selectable>
            <Text style={{ fontWeight: 'bold' }}>Verified:</Text>{' '}
            {submissionData?.['Verified_Ward']}
          </Text>
          <Text selectable>
            <Text style={{ fontWeight: 'bold' }}>New Ward No:</Text>{' '}
            {submissionData?.['New Ward No (Current)']}
          </Text>
          <Text selectable>
            <Text style={{ fontWeight: 'bold' }}>Verified:</Text>{' '}
            {submissionData?.['Verified_NewWard']}
          </Text>
          <Text selectable>
            <Text style={{ fontWeight: 'bold' }}>Zone:</Text>{' '}
            {submissionData?.['Zone (Current)']}
          </Text>
          <Text selectable>
            <Text style={{ fontWeight: 'bold' }}>Verified:</Text>{' '}
            {submissionData?.['Verified_Zone']}
          </Text>
          <Text selectable>
            <Text style={{ fontWeight: 'bold' }}>Property Type:</Text>{' '}
            {submissionData?.['Property Type (Current)']}
          </Text>
          <Text selectable>
            <Text style={{ fontWeight: 'bold' }}>Verified:</Text>{' '}
            {submissionData?.['Verified_PropertyType']}
          </Text>
        </Card>

        {floorIds?.length > 0 && (
          <>
            <Text selectable style={styles.sectionTitle}>Floor Details</Text>
            {floorIds.map((floor, index) => (
              <View key={index} style={styles.card}>
                <Text selectable style={styles.cardTitle}>
                  {floor.floorName || `Floor ${index + 1}`} Details
                </Text>
                <Text selectable>Floor Name: {floor.floorName || '-'}</Text>
                <Text selectable>Construction Type: {floor.constructionType || '-'}</Text>
                <Text selectable>Occupancy Type: {floor.occupancyName || '-'}</Text>
                <Text selectable>Usage Type: {floor.usageType || '-'}</Text>
                <Text selectable>Built-up Area: {floor.builtupArea || '-'}</Text>
                <Text selectable>Carpet Area: {floor.carpetArea || '-'}</Text>
                <Text selectable>Date From: {floor.dateFrom || '-'}</Text>
                <Text selectable>Date To: {floor.dateUpto || '-'}</Text>
              </View>
            ))}
          </>
        )}

        {/* ✅ Floor, Extra Floors, Location, Photos only for non-ULB users */}
        {!isULBUser && (
          <>
            {/* Floor Details */}

            {/* Extra Floors */}
            {submissionData?.extraFloors?.length > 0 && (
              <>
                <Text selectable style={styles.sectionTitle}>Extra Floors</Text>
                {submissionData.extraFloors.map((floor, index) => (
                  <View key={index} style={styles.card}>
                    <Text selectable style={styles.cardTitle}>Floor {index + 1}</Text>
                    <Text selectable>Floor Name: {floor.floorName}</Text>
                    <Text selectable>Construction Type: {floor.constructionType}</Text>
                    <Text selectable>Occupancy Type: {floor.occupancyType}</Text>
                    <Text selectable>Usage Type: {floor.usageType}</Text>
                    <Text selectable>From Date: {floor.fromDate}</Text>
                    <Text selectable>To Date: {floor.toDate}</Text>
                  </View>
                ))}
              </>
            )}

            {/* Location */}
            <Text selectable style={styles.sectionTitle}>Location</Text>
            {location ? (
              <View>
                <Text selectable>Latitude: {location.latitude}</Text>
                <Text selectable>Longitude: {location.longitude}</Text>
              </View>
            ) : (
              <Text selectable>No location data</Text>
            )}

            {/* Photos */}
            <Text selectable style={styles.sectionTitle}>Captured Photos</Text>
            {photos.map((photo, index) =>
              photo.uri ? (
                <View key={index} style={{ marginBottom: 10 }}>
                  <Text selectable style={{ fontWeight: 'bold' }}>{photo.label}</Text>
                  <Image source={{ uri: photo.uri }} style={styles.image} />
                </View>
              ) : (
                <Text selectable key={index}>{photo.label} not captured</Text>
              ),
            )}
          </>
        )}

        {/* Submit Button */}

        <View style={styles.submitButtonContainer}>
          <CopyableTouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={[styles.submitButtonText, uiStyles.primaryButtonText]}>Submit</Text>
          </CopyableTouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal for Remarks + Send to Level */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <CopyableTouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </CopyableTouchableOpacity>

            <Text selectable style={styles.modalTitle}>Remarks</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your remarks"
              value={remarks}
              onChangeText={setRemarks}
              multiline
            />

            <View style={styles.buttonRow}>
              {isULBUser && (
                <>
                  <CopyableTouchableOpacity
                    style={[styles.actionButton, styles.backwardButton]}
                    onPress={() => handleSendToLevel('BACKWARD')}
                  >
                    <Text style={styles.buttonText}>Backward</Text>
                  </CopyableTouchableOpacity>
                </>
              )}

              <CopyableTouchableOpacity
                style={[styles.actionButton, styles.forwardButton]}
                onPress={() => handleSendToLevel('FORWARD')}
              >
                <Text style={styles.buttonText}>Forward</Text>
              </CopyableTouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default SubmitVarification;

const styles = StyleSheet.create({
  actionButton: {
    ...uiStyles.primaryButton,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  forwardButton: {
    backgroundColor: '#4CAF50', // Green
  },
  backwardButton: {
    backgroundColor: '#F44336', // Red
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonText: {
    ...uiStyles.buttonText,
    color: '#fff',
  },
  submitButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitButton: {
    ...uiStyles.primaryButton,
  },
  submitButtonText: {
    ...uiStyles.primaryButtonText,
  },
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionTitle: {
    ...uiStyles.cardTitle,
    marginTop: 20,
    ...cardHeader,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    ...uiStyles.cardTitle,
    marginBottom: 8,
    ...cardHeader,
  },
  image: {
    width: '100%',
    height: 150,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#560606ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    elevation: 5,
  },
  modalTitle: {
    ...uiStyles.title,
    marginBottom: 10,
  },
  input: {
    ...uiStyles.input,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  sendButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
