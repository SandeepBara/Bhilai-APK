export const shopFields = [
  ['Consumer No.', 'consumerNo'], ['Ward No.', 'wardNo'], ['Area Name', 'areaName'],
  ['Shop No.', 'shopNo'], ['Nigam Reg. No.', 'regNo'], ['Holding No.', 'holdingNo'],
  ['Shop Build Type', 'shopType'], ['Samiti Name', 'samitiName'], ['Yojna Name', 'yojnaName'],
  ['Premium Amount', 'premiumAmt'], ['Pincode', 'pinCode'], ['Address', 'address'],
  ['Allotment Date', 'allotmentDate'], ['Apply Date', 'applyDate'],
];
export const ownerFields = [
  ['Owner Name', 'ownerName'], ['Guardian Name', 'guardianName'],
  ['Relation', 'relationType'], ['Mobile No.', 'mobileNo'],
];

export const demandFields = [
  ['Demand From', 'demandFrom'], ['Demand Through', 'demandUpto'], ['Demand Amount', 'amount'],
  ['Penalty', 'penalty'], ['Balance', 'balance'],
];

export const isTrue = value => [true, 1, '1', 'true'].includes(value);
