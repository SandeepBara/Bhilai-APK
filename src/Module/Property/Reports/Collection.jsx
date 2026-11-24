import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  responsiveHeight as rh,
  responsiveWidth as rw,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';
import Colors from '../../Constants/Colors';
import HeaderNavigation from '../../../Components/HeaderNavigation';
import { PROPERTY_REPORTS_API } from '../../../api/apiRoutes';
import axios from 'axios';
import { getToken } from '../../../utils/auth';
import { useMasterData } from '../../../Context/MasterDataContext';
import Pagination from '../../../Components/Pagination';
import PaymentReceiptModal from '../Saf/PaymentReceiptModal';
import { CopyableTouchableOpacity } from '../../../Components/CopyableControl';
const CollectionReport = () => {
  const [wardOptions, setWardOptions] = useState([]);

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const [datas, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const collectorOptions = [
    { label: 'Mithlesh Patel', value: '62' },
    { label: 'Jubali Kumari', value: '63' },
  ];

  const { wardList, ownershipType, propertyTypeList } = useMasterData();

  useEffect(() => {
    if (wardList && wardList.length > 0) {
      const wards = wardList.map(item => ({
        label: item.wardNo,
        value: item.id,
      }));
      setWardOptions(wards);
      console.log('✅ Ward Options:', wards);
    }
  }, [wardList]);

  const paymentModeOptions = [
    { label: 'CASH', value: 'CASH' },
    { label: 'DD', value: 'DD' },
    { label: 'ONLINE', value: 'ONLINE' },
  ];

  const fetchReport = async (pageNo = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const token = await getToken();

      const payload = {
        page: pageNo,
        perPage: 10,
        key: null,
        fromDate: fromDate ? fromDate.toISOString().split('T')[0] : '',
        uptoDate: toDate ? toDate.toISOString().split('T')[0] : '',
        wardId: selectedWard ? Number(selectedWard) : null,
        paymentMode: selectedMode || null,
        userId: selectedCollector || null,
        appType: null,
      };
      console.log('Payload:', payload);

      const response = await axios.post(
        PROPERTY_REPORTS_API.COLLECTION_REPORT_API,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const responseData = response.data.data;
      setLastPage(responseData.lastPage || 1);

      if (isLoadMore) {
        setData(prev => [...prev, ...responseData.data]);
      } else {
        setData(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchReport(1);
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchReport(1);
  };

  const loadMore = () => {
    if (page < lastPage && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReport(nextPage, true);
    }
  };

  const apShowReceipt = item => {
    setReceiptData(item);
    setShowReceipt(true);
  };

  const TableHeader = () => (
    <View style={styles.tableHeader}>
      <Text selectable style={[styles.tableHeaderCell, { width: 100 }]}>SAF No</Text>
      <Text selectable style={[styles.tableHeaderCell, { width: 120 }]}>Owner</Text>
      <Text selectable style={[styles.tableHeaderCell, { width: 100 }]}>Mobile</Text>
      <Text selectable style={[styles.tableHeaderCell, { width: 60 }]}>Ward</Text>
      <Text selectable style={[styles.tableHeaderCell, { width: 100 }]}>Payment Mode</Text>
      <Text selectable style={[styles.tableHeaderCell, { width: 80 }]}>Demand</Text>
      <Text selectable style={[styles.tableHeaderCell, { width: 80 }]}>Payable</Text>
      <Text selectable style={[styles.tableHeaderCell, { width: 120 }]}>Tran No</Text>
      <Text selectable style={[styles.tableHeaderCell, { width: 100 }]}>Date</Text>
      <Text selectable style={[styles.tableHeaderCell, { width: 120 }]}>Collected By</Text>
      <Text selectable style={[styles.tableHeaderCell, { width: 70 }]}>Action</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text selectable style={[styles.tableCell, { width: 100 }]}>{item.safNo}</Text>
      <Text selectable style={[styles.tableCell, { width: 120 }]}>{item.ownerName}</Text>
      <Text selectable style={[styles.tableCell, { width: 100 }]}>{item.mobileNo}</Text>
      <Text selectable style={[styles.tableCell, { width: 60 }]}>{item.wardNo}</Text>
      <Text selectable style={[styles.tableCell, { width: 100 }]}>{item.paymentMode}</Text>
      <Text selectable style={[styles.tableCell, { width: 80 }]}>{item.demandAmt}</Text>
      <Text selectable style={[styles.tableCell, { width: 80 }]}>{item.payableAmt}</Text>
      <Text selectable style={[styles.tableCell, { width: 120 }]}>{item.tranNo}</Text>
      <Text selectable style={[styles.tableCell, { width: 100 }]}>{item.tranDate}</Text>
      <Text selectable style={[styles.tableCell, { width: 120 }]}>{item.userName}</Text>
      <CopyableTouchableOpacity
        style={{
          width: 70,
          backgroundColor: '#a1a3edff',
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 2,
          borderRadius: 5,
        }}
        onPress={() => apShowReceipt(item)}
      >
        <Text style={styles.tableCell}>View</Text>
      </CopyableTouchableOpacity>
    </View>
  );
  return (
    <View style={styles.container}>
      <HeaderNavigation />

      {/* Search Card */}
      <View style={styles.searchCard}>
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text selectable style={styles.label}>From Date</Text>
            <CopyableTouchableOpacity
              style={styles.input}
              onPress={() => setShowFromPicker(true)}
            >
              <Text>{fromDate.toLocaleDateString()}</Text>
            </CopyableTouchableOpacity>
            {showFromPicker && (
              <DateTimePicker
                value={fromDate}
                mode="date"
                display="default"
                onChange={(e, date) => {
                  setShowFromPicker(false);
                  if (date) setFromDate(date);
                }}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text selectable style={styles.label}>To Date</Text>
            <CopyableTouchableOpacity
              style={styles.input}
              onPress={() => setShowToPicker(true)}
            >
              <Text>{toDate.toLocaleDateString()}</Text>
            </CopyableTouchableOpacity>
            {showToPicker && (
              <DateTimePicker
                value={toDate}
                mode="date"
                display="default"
                onChange={(e, date) => {
                  setShowToPicker(false);
                  if (date) setToDate(date);
                }}
              />
            )}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text selectable style={styles.label}>Collector</Text>
            <Dropdown
              data={collectorOptions}
              labelField="label"
              valueField="value"
              placeholder="Select Collector"
              value={selectedCollector}
              onChange={item => setSelectedCollector(item.value)}
              style={styles.dropdown}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text selectable style={styles.label}>Ward</Text>
            <Dropdown
              data={wardOptions}
              labelField="label"
              valueField="value"
              placeholder="Select Ward"
              value={selectedWard}
              onChange={item => setSelectedWard(item.value)}
              style={styles.dropdown}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text selectable style={styles.label}>Payment Mode</Text>
            <Dropdown
              data={paymentModeOptions}
              labelField="label"
              valueField="value"
              placeholder="Select Payment Mode"
              value={selectedMode}
              onChange={item => setSelectedMode(item.value)}
              style={styles.dropdown}
            />
          </View>
        </View>

        <CopyableTouchableOpacity
          style={styles.cardSearchButton}
          onPress={handleSearch}
        >
          <Text style={styles.cardSearchText}>Search</Text>
        </CopyableTouchableOpacity>
      </View>

      {/* Table List */}
      {/* 🔹 TABLE SCROLL (HORIZONTAL) */}
      {/* Table List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        style={{ marginTop: 10 }}
      >
        <View style={{ minWidth: 1050 }}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : (
            <FlatList
              data={datas}
              keyExtractor={(item, index) =>
                item.id?.toString() || index.toString()
              }
              renderItem={renderItem}
              ListHeaderComponent={<TableHeader />}
              stickyHeaderIndices={[0]}
              contentContainerStyle={{ paddingBottom: 20 }}
              onEndReached={loadMore}
              onEndReachedThreshold={0.2}
              ListFooterComponent={
                loadingMore ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : null
              }
            />
          )}
        </View>
      </ScrollView>

      {/* 🔥 Pagination Component Added Here */}
      <Pagination
        page={page}
        lastPage={lastPage}
        total={datas.length}
        onNext={() => {
          if (page < lastPage) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchReport(nextPage);
          }
        }}
        onPrev={() => {
          if (page > 1) {
            const prevPage = page - 1;
            setPage(prevPage);
            fetchReport(prevPage);
          }
        }}
        onPageChange={num => {
          setPage(num);
          fetchReport(num);
        }}
      />

      <PaymentReceiptModal
        visible={showReceipt}
        onClose={() => setShowReceipt(false)}
        paymentDtls={receiptData}
      />
    </View>
  );
};

export default CollectionReport;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  /* 🔶 Search Card */
  searchCard: {
    backgroundColor: '#fff',
    marginHorizontal: rw(1),
    marginTop: rh(0.5),
    borderRadius: 8,
    paddingVertical: rh(1.2),
    paddingHorizontal: rw(2),
    elevation: 2,
    borderWidth: 0.3,
    borderColor: '#e0e0e0',
  },

  row: {
    flexDirection: 'row',
    marginBottom: rh(1),
  },

  inputContainer: {
    width: '50%',
    paddingHorizontal: rw(1),
  },

  label: {
    fontSize: rf(1.6),
    marginBottom: 4,
    color: '#4A4A4A',
    fontWeight: '600',
  },

  input: {
    borderWidth: 1,
    borderColor: '#cfcfcf',
    borderRadius: 8,
    paddingVertical: rh(1.2),
    paddingHorizontal: rw(3),
    backgroundColor: '#fafafa',
  },

  dropdown: {
    borderWidth: 1,
    borderColor: '#cfcfcf',
    borderRadius: 8,
    height: rh(6),
    paddingHorizontal: rw(3),
    backgroundColor: '#fafafa',
  },

  cardSearchButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rh(1.5),
    marginTop: rh(1),
  },

  cardSearchText: {
    color: '#fff',
    fontSize: rf(1.9),
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  /* 🔶 TABLE HEADER */
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: rh(1.2),
    paddingHorizontal: rw(1),
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },

  tableHeaderCell: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 10,
    textAlign: 'center',
    paddingHorizontal: rw(1),
  },

  /* 🔶 TABLE ROW */
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: rh(1),
    paddingHorizontal: rw(1),
    borderBottomWidth: 0.4,
    borderBottomColor: '#dcdcdc',
  },

  tableCell: {
    fontSize: 10,
    color: '#2b2b2b',
    textAlign: 'center',
    paddingHorizontal: rw(1),
  },

  /* 🔶 ACTION BUTTON in table */
  actionButton: {
    flex: 2,
    backgroundColor: '#a1a3ed',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: rh(0.8),
    borderRadius: 6,
  },

  actionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});
