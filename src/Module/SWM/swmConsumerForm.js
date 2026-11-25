export const text = value => String(value ?? '');
export const month = date => date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
export const emptyOwner = key => ({ key, ownerName: '', guardianName: '', relationType: '', mobileNo: '', email: '' });
export const emptyConnection = key => ({
  key, categoryTypeMasterId: '', subCategoryTypeMasterId: '', totalNoOfHouseAreaRoomTruck: '1',
  hasRestaurant: false, totalNoOfRestaurant: '0', hasGarden: false, totalNoOfGarden: '0',
  hasBanquetHall: false, totalNoOfBanquetHall: '0',
});
export const relations = ['S/O', 'D/O', 'W/O', 'C/O'].map(value => ({ label: value, value }));
export const facilities = [
  ['Restaurant', 'hasRestaurant', 'totalNoOfRestaurant'],
  ['Garden', 'hasGarden', 'totalNoOfGarden'],
  ['Banquet Hall', 'hasBanquetHall', 'totalNoOfBanquetHall'],
];
export const options = (items, field) => (Array.isArray(items) ? items : []).map(item => ({
  label: text(item[field] ?? item.name ?? item.id), value: text(item.id),
}));
export const initialProperty = {
  holdingNo: '', wardMstrId: '', houseNo: '', address: '', landmark: '',
  policeStation: '', streetName: '', locality: '', pinCode: '',
};

export const connectionPayload = ({ key, ...connection }) => ({
  ...connection,
  totalNoOfHouseAreaRoomTruck: Number(connection.totalNoOfHouseAreaRoomTruck),
  totalNoOfRestaurant: connection.hasRestaurant ? Number(connection.totalNoOfRestaurant) : 0,
  totalNoOfGarden: connection.hasGarden ? Number(connection.totalNoOfGarden) : 0,
  totalNoOfBanquetHall: connection.hasBanquetHall ? Number(connection.totalNoOfBanquetHall) : 0,
});

export function consumerPayload(property, owners, connections, effective) {
  return {
    ...Object.fromEntries(Object.entries(property).map(([key, value]) => [key, value.trim()])),
    dateOfEffective: effective,
    ownerDtl: owners.map(({ key, ...owner }) =>
      Object.fromEntries(Object.entries(owner).map(([field, value]) => [field, value.trim()]))),
    connectionDtl: connections.map(connectionPayload),
  };
}

export function validate(property, owners, connections, effective, verifiedHolding) {
  if (!property.holdingNo.trim() || property.holdingNo.trim() !== verifiedHolding) {
    return 'Verify the holding number first.';
  }
  if (!property.wardMstrId || property.address.trim().length < 5 || !/^\d{6}$/.test(property.pinCode)) {
    return 'Select a ward, enter a full address, and provide a six-digit pin code.';
  }
  if (!effective || effective > month(new Date())) return 'Select an effective month no later than the current month.';
  for (const [index, owner] of owners.entries()) {
    if (!owner.ownerName.trim() || !owner.guardianName.trim() || !owner.relationType || !/^\d{10}$/.test(owner.mobileNo.trim())) {
      return 'Enter the name, guardian, relation, and ten-digit mobile number for owner ' + (index + 1) + '.';
    }
    if (owner.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(owner.email.trim())) {
      return 'Enter a valid email address for owner ' + (index + 1) + '.';
    }
  }
  for (const [index, item] of connections.entries()) {
    if (!item.categoryTypeMasterId || !item.subCategoryTypeMasterId ||
      !Number.isFinite(Number(item.totalNoOfHouseAreaRoomTruck)) || Number(item.totalNoOfHouseAreaRoomTruck) < 1) {
      return 'Select a category and sub-category and enter a quantity of at least 1 for connection ' + (index + 1) + '.';
    }
    for (const [label, enabled, quantity] of facilities) {
      if (item[enabled] && (!item[quantity].trim() || !Number.isFinite(Number(item[quantity])) || Number(item[quantity]) < 0)) {
        return 'Enter a valid ' + label.toLowerCase() + ' quantity for connection ' + (index + 1) + '.';
      }
    }
  }
  return '';
}
