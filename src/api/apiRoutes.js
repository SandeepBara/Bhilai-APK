import { BASE_URL } from '../config';

// Authentication and user profile
export const LOGIN_API = `${BASE_URL}/api/login`;

export const FORGET_PASS_API = `${BASE_URL}/api/forgot-password`

export const OTP_VERIFY_API = `${BASE_URL}/api/otp-verify`

export const CHANGE_PASS_API = `${BASE_URL}/api/otp-change-pass`

export const usrProfileApi = `${BASE_URL}/api/user-profile`

// Shared services
export const WARD_LIST_API = `${BASE_URL}/api/ward`;
export const WORK_FLOW_PERMISSION = `${BASE_URL}/api/get-workflow-permission`;

export const Ulb_Api = (id) => `${BASE_URL}/api/ulb/show/${id}`;

// Property holdings and SAF
export const PROPERTY_VALIDATE_HOLDING_API = `${BASE_URL}/api/property/validate-holding`;
export const SAF_INBOX_API = page => `${BASE_URL}/api/property/inbox?page=${page}`;
export const SAF_SEARCH_API = `${BASE_URL}/api/property/search-saf`;
export const SAF_DETAILS_API = `${BASE_URL}/api/property/get-saf-dtl`;
export const SAF_DEMAND_API = `${BASE_URL}/api/property/get-saf-demand`;
export const SAF_PAY_DEMAND_API = `${BASE_URL}/api/property/pay-saf-demand`;
export const SAF_RECEIPT_API = `${BASE_URL}/api/property/payment-receipt`;
export const SAF_DOCUMENTS_API = `${BASE_URL}/api/property/get-uploaded-doc-list`;
export const SAF_FIELD_VERIFICATION_API = `${BASE_URL}/api/property/get-saf-field-verification`;

export const NEW_WARD_BY_OLD_API = `${BASE_URL}/api/property/get-new-ward-by-old`;

export const SAF_MASTER_DATA_API = `${BASE_URL}/api/property/get-saf-master-data`;
export const SAF_SUBMIT_FIELD_VERIFICATION_API = `${BASE_URL}/api/property/field-verification`;
export const PROPERTY_GEOTAG_IMAGE_API = `${BASE_URL}/api/property/geotage`;
export const APARTMENT_BY_OLD_WARD_API = `${BASE_URL}/api/property/get-apartment-by-old-ward`;
export const SAF_TEST_REQUEST_API = `${BASE_URL}/api/property/test-request`;

export const SAF_REVIEW_TAX_API = `${BASE_URL}/api/property/review-tax`;
export const SAF_FIELD_VERIFICATION_DETAILS_API = `${BASE_URL}/api/property/field-verification-dtl`;
export const SAF_APPLY_API = `${BASE_URL}/api/property/saf-apply`;
export const SAF_POST_NEXT_API = `${BASE_URL}/api/property/post-next`;

export const HOLDING_SEARCH_API = `${BASE_URL}/api/property/search-prop`;
export const HOLDING_DETAILS_API = `${BASE_URL}/api/property/get-prop-dtl`;
export const HOLDING_DEMAND_API = `${BASE_URL}/api/property/get-prop-demand`;
export const HOLDING_PAY_DEMAND_API = `${BASE_URL}/api/property/pay-prop-demand`;
export const HOLDING_PAYMENT_RECEIPT_API = `${BASE_URL}/api/property/prop-payment-receipt`;

// Property reports
export const PROPERTY_COLLECTION_REPORT_API = `${BASE_URL}/api/property/report/collection`;
export const PROPERTY_PAYMENT_MODE_SUMMARY_API = `${BASE_URL}/api/property/report/collection-summary`;

export const PROPERTY_PAYMENT_MODE_API = `${BASE_URL}/api/property/report/payment-mode`;

// Water applications
export const Water_Api = `${BASE_URL}/api/water/app`;

export const WATER_APPLICATION_SEARCH_API = `${Water_Api}/search`;
export const WATER_APPLICATION_DETAILS_API = `${Water_Api}/dtl`;
export const WATER_APPLICATION_DUE_API = `${Water_Api}/due`;
export const WATER_APPLICATION_PAY_DEMAND_API = `${Water_Api}/pay-demand`;
export const WATER_APPLICATION_PAYMENT_RECEIPT_API = `${Water_Api}/payment-receipt`;
export const WATER_APPLICATION_DOCUMENTS_API = `${Water_Api}/get-uploaded-doc-list`;
export const WATER_APPLICATION_POST_NEXT_API = `${Water_Api}/post-next`;
export const WATER_APPLICATION_MASTER_DATA_API = `${Water_Api}/master-data`;
export const WATER_APPLICATION_TEST_REQUEST_API = `${Water_Api}/test-request`;
export const WATER_APPLICATION_APPLY_API = `${Water_Api}/apply-connection`;
export const WATER_APPLICATION_REVIEW_TAX_API = `${Water_Api}/review-tax`;
export const WATER_APPLICATION_INBOX_API = `${Water_Api}/inbox`;
export const WATER_APPLICATION_FIELD_VERIFICATION_API = `${Water_Api}/field-verification`;
export const WATER_APPLICATION_GET_FIELD_VERIFICATION_API = `${Water_Api}/get-field-verification`;
export const WATER_APPLICATION_FIELD_VERIFICATION_DETAILS_API = `${Water_Api}/field-verification-dtl`;

// Water consumers
export const WATER_CONSUMER_DETAILS_API = `${BASE_URL}/api/water/consumer/dtl`;
export const WATER_CONSUMER_SEARCH_API = `${BASE_URL}/api/water/consumer/search`;
export const WATER_CONSUMER_DUE_API = `${BASE_URL}/api/water/consumer/due`;
export const WATER_CONSUMER_PAYMENT_RECEIPT_API = `${BASE_URL}/api/water/consumer/payment-receipt`;
export const WATER_CONSUMER_PAY_DUE_API = `${BASE_URL}/api/water/consumer/pay-due`;
export const WATER_CONSUMER_GENERATE_DEMAND_API = `${BASE_URL}/api/water/consumer/generate-demand`;
export const WATER_CONSUMER_DEMAND_HISTORY_API = `${BASE_URL}/api/water/consumer/demand-history
`;

// Solid Waste Management
export const SWM_SEARCH_API = `${BASE_URL}/api/swm/consumer-search`;
export const SWM_DETAILS_API = `${BASE_URL}/api/swm/consumer-dtl`;
export const SWM_DEMAND_HISTORY_API = `${BASE_URL}/api/swm/demand-history`;
export const SWM_DUE_API = `${BASE_URL}/api/swm/consumer-due`;
export const SWM_GENERATE_DEMAND_API = `${BASE_URL}/api/swm/generate-demand`;
export const SWM_PAY_DUE_API = `${BASE_URL}/api/swm/pay-due`;
export const SWM_PAYMENT_RECEIPT_API = `${BASE_URL}/api/swm/payment-receipt`;
export const SWM_MASTER_DATA_API = `${BASE_URL}/api/swm/get-master-data`;
export const SWM_SUBCATEGORY_LIST_API = `${BASE_URL}/api/swm/master/sub-category-list`;
export const SWM_RATE_API = `${BASE_URL}/api/swm/get-rate`;
export const SWM_ADD_CONSUMER_API = `${BASE_URL}/api/swm/consumer-add`;
