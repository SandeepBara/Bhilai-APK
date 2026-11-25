import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { SAF_FIELD_VERIFICATION_DETAILS_API } from '../../../../api/apiRoutes';
import Colors from '../../../Constants/Colors';
import { CopyableTouchableOpacity } from '../../../../Components/CopyableControl';
import { uiStyles } from '../../../../style/theme';

export const TCVerificationModal = ({ visible, onClose, id }) => {
  const [extraFloor, setExtraFloor] = useState([]);
  const [floorCom, setFloorCom] = useState([]);
  const [geoTag, setGeoTag] = useState([]);
  const [ownerDtl, setOwnerDtl] = useState([]);
  const [safComp, setSafComp] = useState([]);
  const [safDtl, setSafDtl] = useState(null);
  const [tcDtl, setTcDtl] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSafDetails = async () => {
      setLoading(true);
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const token = storedToken ? JSON.parse(storedToken) : null;

        if (!token) {
          Alert.alert('Error', 'Authentication token not found.');
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const response = await axios.post(
          SAF_FIELD_VERIFICATION_DETAILS_API,
          { id },
          { headers },
        );

        const apiData = response.data?.data;

        if (apiData) {
          setExtraFloor(apiData.extraFloor || []);
          setFloorCom(apiData.floorCom || []);
          setGeoTag(apiData.getGeoTag || []);
          setOwnerDtl(apiData.ownerDtl || []);
          setSafComp(apiData.safComp || []);
          setSafDtl(apiData.safDtl || null);
          setTcDtl(apiData.tcDtl || null);
        }
      } catch (error) {
        Alert.alert(
          'Error',
          'Failed to load property details. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSafDetails();
  }, [id]);

  const renderCheck = val => {
    if (val === true || val === 'Yes') return '✅';
    if (val === false || val === 'No') return '❌';
    return val || '-';
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Close */}
          <CopyableTouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </CopyableTouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text selectable style={styles.header}>
              Tax Collector Verification Details
            </Text>

            {/* SAF Details */}
            <View style={styles.section}>
              <Text selectable style={styles.sectionTitle}>Basic Details</Text>
              <Text selectable>SAF No: {safDtl?.safNo}</Text>
              <Text selectable>Applied Date: {safDtl?.applyDate}</Text>
              <Text selectable>Application Type: {safDtl?.assessmentType}</Text>
              <Text selectable>Ownership Type: {safDtl?.ownershipType}</Text>
            </View>

            {/* TC Details */}
            <View style={styles.section}>
              <Text selectable style={styles.sectionTitle}>Tax Collector</Text>
              <Text selectable>Name: {tcDtl?.userName}</Text>
              <Text selectable>Verified By: {tcDtl?.verifiedBy}</Text>
              <Text selectable>Date of Verification: {tcDtl?.verificationDate}</Text>
            </View>

            {/* Owner Details */}
            <View style={styles.section}>
              <Text selectable style={styles.sectionTitle}>Owner(s)</Text>
              <View style={styles.tableRowHeader}>
                <Text selectable style={styles.cell}>#</Text>
                <Text selectable style={styles.cell}>Name</Text>
                <Text selectable style={styles.cell}>Guardian</Text>
                <Text selectable style={styles.cell}>Relation</Text>
                <Text selectable style={styles.cell}>Mobile</Text>
              </View>
              {ownerDtl.map((o, i) => (
                <View style={styles.tableRow} key={i}>
                  <Text selectable style={styles.cell}>{i + 1}</Text>
                  <Text selectable style={styles.cell}>{o.ownerName || '-'}</Text>
                  <Text selectable style={styles.cell}>{o.guardianName || '-'}</Text>
                  <Text selectable style={styles.cell}>{o.relationType || '-'}</Text>
                  <Text selectable style={styles.cell}>{o.mobileNo || '-'}</Text>
                </View>
              ))}
            </View>

            {/* SAF Comparison */}
            <View style={styles.section}>
              <Text selectable style={styles.sectionTitle}>Verified Details</Text>
              <View style={styles.tableRowHeader}>
                <Text selectable style={styles.cell}>Particular</Text>
                <Text selectable style={styles.cell}>Self</Text>
                <Text selectable style={styles.cell}>Check</Text>
                <Text selectable style={styles.cell}>Verification</Text>
              </View>
              {safComp.map((c, i) => (
                <View style={styles.tableRow} key={i}>
                  <Text selectable style={styles.cell}>{c.key}</Text>
                  <Text selectable style={styles.cell}>{renderCheck(c.self)}</Text>
                  <Text selectable style={styles.cell}>{renderCheck(c.test)}</Text>
                  <Text selectable style={styles.cell}>{renderCheck(c.verify)}</Text>
                </View>
              ))}
            </View>

            {/* Floor Verified Details */}
            <View style={styles.section}>
              <Text selectable style={styles.sectionTitle}>Floor Verified Details</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View>
                  {/* Header */}
                  <View style={styles.tableRowHeader}>
                    <Text selectable style={styles.cell}>Floor</Text>
                    <Text selectable style={styles.cell}>Usage(Self)</Text>
                    <Text selectable style={styles.cell}>Usage(Verify)</Text>
                    <Text selectable style={styles.cell}>Check</Text>
                    <Text selectable style={styles.cell}>Occupancy(Self)</Text>
                    <Text selectable style={styles.cell}>Occupancy(Verify)</Text>
                    <Text selectable style={styles.cell}>Check</Text>
                    <Text selectable style={styles.cell}>Construction(Self)</Text>
                    <Text selectable style={styles.cell}>Construction(Verify)</Text>
                    <Text selectable style={styles.cell}>Check</Text>
                    <Text selectable style={styles.cell}>Built-up(Self)</Text>
                    <Text selectable style={styles.cell}>Built-up(Verify)</Text>
                    <Text selectable style={styles.cell}>Check</Text>
                    <Text selectable style={styles.cell}>Carpet(Self)</Text>
                    <Text selectable style={styles.cell}>Carpet(Verify)</Text>
                    <Text selectable style={styles.cell}>Check</Text>
                    <Text selectable style={styles.cell}>DateFrom(Self)</Text>
                    <Text selectable style={styles.cell}>DateFrom(Verify)</Text>
                    <Text selectable style={styles.cell}>Check</Text>
                    <Text selectable style={styles.cell}>DateUpto(Self)</Text>
                    <Text selectable style={styles.cell}>DateUpto(Verify)</Text>
                    <Text selectable style={styles.cell}>Check</Text>
                  </View>

                  {/* Data Rows */}
                  {floorCom.map((f, i) => (
                    <View style={styles.tableRow} key={i}>
                      <Text selectable style={styles.cell}>{f.floorName}</Text>

                      {/* Usage */}
                      <Text selectable style={styles.cell}>
                        {f.usageType?.self || '-'}
                      </Text>
                      <Text selectable style={styles.cell}>
                        {f.usageType?.verify || '-'}
                      </Text>
                      <Text selectable style={styles.cell}>
                        {renderCheck(f.usageType?.test)}
                      </Text>

                      {/* Occupancy */}
                      <Text selectable style={styles.cell}>
                        {f.occupancyName?.self || '-'}
                      </Text>
                      <Text selectable style={styles.cell}>
                        {f.occupancyName?.verify || '-'}
                      </Text>
                      <Text selectable style={styles.cell}>
                        {renderCheck(f.occupancyName?.test)}
                      </Text>

                      {/* Construction */}
                      <Text selectable style={styles.cell}>
                        {f.constructionType?.self || '-'}
                      </Text>
                      <Text selectable style={styles.cell}>
                        {f.constructionType?.verify || '-'}
                      </Text>
                      <Text selectable style={styles.cell}>
                        {renderCheck(f.constructionType?.test)}
                      </Text>

                      {/* Built-up */}
                      <Text selectable style={styles.cell}>
                        {f.builtupArea?.self || '-'}
                      </Text>
                      <Text selectable style={styles.cell}>
                        {f.builtupArea?.verify || '-'}
                      </Text>
                      <Text selectable style={styles.cell}>
                        {renderCheck(f.builtupArea?.test)}
                      </Text>

                      {/* Carpet */}
                      <Text selectable style={styles.cell}>
                        {f.carpetArea?.self || '-'}
                      </Text>
                      <Text selectable style={styles.cell}>
                        {f.carpetArea?.verify || '-'}
                      </Text>
                      <Text selectable style={styles.cell}>
                        {renderCheck(f.carpetArea?.test)}
                      </Text>

                      {/* Date From */}
                      <Text selectable style={styles.cell}>{f.dateFrom?.self || '-'}</Text>
                      <Text selectable style={styles.cell}>
                        {f.dateFrom?.verify || '-'}
                      </Text>
                      <Text selectable style={styles.cell}>
                        {renderCheck(f.dateFrom?.test)}
                      </Text>

                      {/* Date Upto */}
                      <Text selectable style={styles.cell}>{f.dateUpto?.self || '-'}</Text>
                      <Text selectable style={styles.cell}>
                        {f.dateUpto?.verify || '-'}
                      </Text>
                      <Text selectable style={styles.cell}>
                        {renderCheck(f.dateUpto?.test)}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Geo Tagging */}
            <View style={styles.section}>
              <Text selectable style={styles.sectionTitle}>Geo Tagging</Text>
              <View style={styles.tableRowHeader}>
                <Text selectable style={styles.cell}>Location</Text>
                <Text selectable style={styles.cell}>Lat</Text>
                <Text selectable style={styles.cell}>Long</Text>
                <Text selectable style={styles.cell}>View</Text>
              </View>
              {geoTag.map((g, i) => (
                <View style={styles.tableRow} key={i}>
                  <Text selectable style={styles.cell}>{g.directionType}</Text>
                  <Text selectable style={styles.cell}>{g.latitude}</Text>
                  <Text selectable style={styles.cell}>{g.longitude}</Text>
                  <CopyableTouchableOpacity
                    onPress={() =>
                      Linking.openURL(
                        `https://maps.google.com/?q=${g.latitude},${g.longitude}`,
                      )
                    }
                  >
                    <Text style={[styles.cell, { color: 'blue' }]}>
                      Google Map
                    </Text>
                  </CopyableTouchableOpacity>
                </View>
              ))}
            </View>

            {/* Extra Floors */}
            <View style={styles.section}>
              <Text selectable style={styles.sectionTitle}>Extra Floors</Text>
              {extraFloor.length > 0 ? (
                extraFloor.map((f, i) => (
                  <Text selectable key={i}>Floor: {f.floorName}</Text>
                ))
              ) : (
                <Text selectable>No Extra Floors</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 10,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    maxHeight: '90%',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    marginBottom: 5,
  },
  closeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'red',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  section: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
  },
  sectionTitle: {
    ...uiStyles.cardTitle,
    marginBottom: 8,
  },
  tableRowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 4,
    backgroundColor: '#f0f0f0',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 4,
  },
  cell: {
    flex: 1,
    fontSize: 13,
  },
});
