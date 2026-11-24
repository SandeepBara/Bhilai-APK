import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import { Buffer } from 'buffer';
import { PNG } from 'pngjs/browser';
import { useBluetoothPrinter } from '../utils/BluetoothService';
import { CopyableTouchableOpacity } from './CopyableControl';

const bhilaiLogo = require('../assets/bhilai_logo.png');
const WIDTH = 32;
const divider = '-'.repeat(WIDTH);

function wrap(value, width = WIDTH) {
  const text = String(value ?? '-').normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7e]/g, ' ').trim();
  const lines = [];
  let remaining = text || '-';

  while (remaining.length > width) {
    const space = remaining.lastIndexOf(' ', width);
    const end = space > 0 ? space : width;
    lines.push(remaining.slice(0, end));
    remaining = remaining.slice(end).trimStart();
  }
  return [...lines, remaining];
}

const money = value => value == null || value === '' || !Number.isFinite(Number(value))
  ? '-' : 'Rs. ' + Number(value).toFixed(2);
const date = value => typeof value === 'string'
  ? value.replace(/^(\d{4})-(\d{2})-(\d{2})(?:[T ].*)?$/, '$3-$2-$1')
  : value;

function formatReceipt(receipt, kind) {
  const field = (label, value) => {
    const prefix = label.padEnd(15) + ': ';
    const [first, ...rest] = wrap(value, WIDTH - prefix.length);
    return [prefix + first, ...rest.map(line => ' '.repeat(prefix.length) + line)];
  };
  const center = line => ' '.repeat(Math.floor((WIDTH - line.length) / 2)) + line;
  const dues = [receipt.previousPaymentReceipt?.totalDue, receipt.currentPaymentReceipt?.totalDue]
    .filter(value => value != null && value !== '' && Number.isFinite(Number(value)));
  const collector = receipt.userDtl;

  return [
    ...wrap(receipt.ulbDtl?.ulbName || 'BHILAI MUNICIPAL CORPORATION').map(center),
    center('Citizen Copy'),
    center(kind === 'water' ? 'Water Charge Payment Receipt' : 'Holding Tax Payment Receipt'),
    divider,
    ...field('Date', date(receipt.tranDate)),
    ...field('Transaction No.', receipt.tranNo),
    ...field('Payment Mode', receipt.paymentMode),
    ...field('Ward No.', receipt.wardNo),
    ...(kind === 'water' ? [
      ...field('Consumer No.', receipt.consumerNo ?? receipt.consumer_no),
      ...field('Holding No.', receipt.newHoldingNo),
      ...field('Name', receipt.ownerName),
      ...field('Address', receipt.address),
      ...field('Dues From', receipt.periodFrom || date(receipt.fromDate)),
      ...field('Dues Upto', receipt.periodUpto || date(receipt.uptoDate)),
      ...field('Water Charges', money(receipt.demandAmount)),
      ...field('Penalty', money(receipt.penaltyAmt)),
      ...field('Balance Due', money(receipt.dueAmount)),
    ] : [
      ...field('Holding No.', receipt.newHoldingNo || receipt.holdingNo),
      ...field('Name', receipt.ownerName),
      ...field('Address', receipt.address),
      ...field('Dues From', receipt.fromFyear),
      ...field('Dues Upto', receipt.uptoFyear),
      ...field('Rain Harvest', money(receipt.rwhTax)),
      ...field('Total Dues', money(dues.length ? dues.reduce((sum, value) => sum + Number(value), 0) : null)),
    ]),
    divider,
    ...field('Amount Paid', money(receipt.amount)),
    divider,
    'Signature',
    ...(collector?.name ? field('TC Name', collector.name) : []),
    ...(collector?.mobileNo || collector?.mobile
      ? field('Mobile No.', collector.mobileNo || collector.mobile) : []),
    '',
    ...wrap('Please keep this bill for future reference.'),
    divider,
  ].join('\n');
}

async function imageRaster(uri, maxWidth, maxHeight) {
  const path = RNFS.CachesDirectoryPath + '/payment-receipt-image-' + Date.now();
  let resized;
  try {
    if (/^https?:\/\//i.test(uri)) {
      const download = await RNFS.downloadFile({ fromUrl: uri, toFile: path }).promise;
      if (download.statusCode !== 200) throw new Error('Receipt image download failed');
    } else if (uri.startsWith('file://')) {
      await RNFS.copyFile(uri.slice(7), path);
    } else {
      await RNFS.copyFileRes(uri + '.png', path);
    }
    resized = await ImageResizer.createResizedImage(
      'file://' + path, maxWidth, maxHeight, 'PNG', 100,
    );
    const base64 = await RNFS.readFile(resized.path, 'base64');
    const { width, height, data } = PNG.sync.read(Buffer.from(base64, 'base64'));
    const rowBytes = Math.ceil(width / 8);
    const raster = new Uint8Array(rowBytes * height);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const offset = (y * width + x) * 4;
        const brightness = (data[offset] + data[offset + 1] + data[offset + 2]) / 3;
        const opacity = data[offset + 3] / 255;
        if (255 - (255 - brightness) * opacity < 160) {
          raster[y * rowBytes + (x >> 3)] |= 0x80 >> (x % 8);
        }
      }
    }

    return [
      0x1d, 0x76, 0x30, 0, rowBytes & 255, rowBytes >> 8,
      height & 255, height >> 8, ...raster, 10,
    ];
  } finally {
    await Promise.allSettled([
      RNFS.unlink(path),
      ...(resized?.path ? [RNFS.unlink(resized.path)] : []),
    ]);
  }
}

export function BluetoothReceiptModal({ visible, onClose, paymentDtls, kind = 'property' }) {
  const {
    bluetoothDevices, pairedDevices, connectedDevice, scanning, connecting,
    printing, scanForDevices, connectToPrinter, unpairPrinter, printBuffer,
  } = useBluetoothPrinter();
  const requestInFlight = useRef(false);
  const [preparing, setPreparing] = useState(false);
  const [printerPickerVisible, setPrinterPickerVisible] = useState(false);
  const [bluetoothWasOff, setBluetoothWasOff] = useState(false);
  const [unpairing, setUnpairing] = useState(false);
  const pairedAddresses = new Set(pairedDevices.map(device => device.address || device.id));

  const openBluetoothSettings = () => Linking.sendIntent('android.settings.BLUETOOTH_SETTINGS');

  const confirmUnpair = device => {
    Alert.alert('Unpair printer?', device.name || device.address || device.id, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unpair',
        style: 'destructive',
        onPress: async () => {
          setUnpairing(true);
          try {
            if (await unpairPrinter(device)) await findPrinters();
          } finally {
            setUnpairing(false);
          }
        },
      },
    ]);
  };

  const findPrinters = () => {
    setBluetoothWasOff(false);
    return scanForDevices(undefined, async () => {
      setBluetoothWasOff(true);
      await openBluetoothSettings();
    });
  };
  const printerMap = new Map();
  for (const device of [...pairedDevices, ...bluetoothDevices]) {
    const address = device.address || device.id;
    if (address) printerMap.set(address, device);
  }

  const receipt = paymentDtls?.tranNo ? formatReceipt(paymentDtls, kind) : '';
  const printReceipt = async () => {
    if (!receipt || requestInFlight.current) return;
    requestInFlight.current = true;
    setPreparing(true);
    try {
      const signatureUrl = paymentDtls.userDtl?.signatureImg || paymentDtls.userDtl?.signature_img;
      const marker = '\nSignature\n';
      const markerEnd = receipt.indexOf(marker) + marker.length;
      const encode = text => Array.from(text, character => character.charCodeAt(0));
      let bytes = encode(receipt + '\n');
      if (signatureUrl && markerEnd >= marker.length) {
        const signature = await imageRaster(signatureUrl, 192, 80);
        bytes = [
          ...encode(receipt.slice(0, markerEnd)),
          ...signature,
          ...encode(receipt.slice(markerEnd) + '\n'),
        ];
      }
      const paperFeed = encode('\n'.repeat(4));
      const logoUrl = paymentDtls.ulbDtl?.logoImg || paymentDtls.ulbDtl?.leftLogo;
      const bundledLogoUri = Image.resolveAssetSource(bhilaiLogo).uri;
      const logo = logoUrl
        ? await imageRaster(logoUrl, 96, 72).catch(() => imageRaster(bundledLogoUri, 96, 72))
        : await imageRaster(bundledLogoUri, 96, 72);
      await printBuffer([
        27, 64, 27, 77, 0,
        27, 97, 1, ...logo, 27, 97, 0,
        ...bytes, ...paperFeed,
      ]);
    } catch {
      Alert.alert('Receipt image unavailable', 'The logo or signature could not be prepared. Please try again.');
    } finally {
      setPreparing(false);
      requestInFlight.current = false;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text selectable accessibilityRole="header" style={styles.title}>
            {kind === 'water' ? 'Water Payment Receipt' : 'Payment Receipt'}
          </Text>
          <Image source={bhilaiLogo} style={styles.logo} resizeMode="contain" />
          <Text selectable style={styles.receipt}>{receipt}</Text>
          <Text selectable>{connectedDevice ? 'Printer: ' + (connectedDevice.name || connectedDevice.address) : 'Select a Bluetooth printer'}</Text>
          <Button
            title="Find Bluetooth Printers"
            disabled={connecting || printing || preparing}
            onPress={() => {
              setPrinterPickerVisible(true);
              if (!scanning) findPrinters();
            }}
          />
          <Button
            title={printing || preparing ? 'Printing…' : 'Print Receipt'}
            disabled={!receipt || !connectedDevice || printing || preparing || connecting}
            onPress={printReceipt}
          />
          <Button title="Close" onPress={onClose} />
        </ScrollView>
      </SafeAreaView>
      <Modal
        visible={visible && printerPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPrinterPickerVisible(false)}
      >
        <SafeAreaView style={styles.pickerOverlay}>
          <View style={styles.picker}>
            <Text selectable accessibilityRole="header" style={styles.pickerTitle}>Bluetooth Printers</Text>
            {scanning && <Text selectable accessibilityLiveRegion="polite">Searching for devices…</Text>}
            {bluetoothWasOff && (
              <Text selectable accessibilityLiveRegion="polite">
                Turn on Bluetooth in Settings, then tap Scan Again.
              </Text>
            )}
            {!scanning && !bluetoothWasOff && printerMap.size === 0 && (
              <Text selectable accessibilityLiveRegion="polite">No Bluetooth printers found.</Text>
            )}
            <ScrollView style={styles.printerList}>
              {[...printerMap].map(([address, device]) => {
                const paired = pairedAddresses.has(address);
                const busy = connecting || bluetoothWasOff || unpairing;
                return (
                  <View key={address} style={styles.printerRow}>
                    <Text selectable style={styles.printerName}>{device.name || address}</Text>
                    <Text selectable style={styles.printerAddress}>
                      {paired ? 'Paired' : 'Available'}{device.name ? ' · ' + address : ''}
                    </Text>
                    <View style={styles.printerActions}>
                      <CopyableTouchableOpacity
                        accessibilityRole="button"
                        accessibilityState={{ disabled: busy }}
                        disabled={busy}
                        onPress={async () => {
                          if (await connectToPrinter(device)) setPrinterPickerVisible(false);
                        }}
                        style={styles.printerAction}
                      >
                        <Text style={styles.printerActionText}>{paired ? 'Connect' : 'Pair and Connect'}</Text>
                      </CopyableTouchableOpacity>
                      {paired && (
                        <CopyableTouchableOpacity
                          accessibilityRole="button"
                          accessibilityState={{ disabled: busy || scanning }}
                          disabled={busy || scanning}
                          onPress={() => confirmUnpair(device)}
                          style={styles.printerAction}
                        >
                          <Text style={styles.printerActionText}>Unpair</Text>
                        </CopyableTouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            {(connecting || unpairing) && <ActivityIndicator />}
            <View style={styles.pickerActions}>
              <Button title="Scan Again" disabled={scanning || connecting || unpairing} onPress={findPrinters} />
              <Button
                title="Bluetooth Settings"
                disabled={connecting || unpairing}
                onPress={() => openBluetoothSettings().catch(() => Alert.alert('Unable to open Bluetooth settings'))}
              />
              <Button title="Close" onPress={() => setPrinterPickerVisible(false)} />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pickerOverlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
  picker: { maxHeight: '85%', gap: 12, borderRadius: 14, padding: 16, backgroundColor: '#fff' },
  pickerTitle: { fontSize: 18, fontWeight: '700', color: '#10263a' },
  printerList: { flexGrow: 0 },
  printerRow: { minHeight: 48, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#cbd5e1' },
  printerName: { fontWeight: '600', color: '#10263a' },
  printerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  printerAction: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  printerActionText: { color: '#154e80', fontWeight: '700' },
  printerAddress: { color: '#475569' },
  pickerActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#10263a' },
  logo: { width: 64, height: 64, alignSelf: 'center' },
  receipt: { fontFamily: 'monospace', fontSize: 13, padding: 10, color: '#111' },
});
