import axios from 'axios';
import { WATER_APPLICATION_GET_FIELD_VERIFICATION_API } from '../../../../api/apiRoutes';
import { getToken } from '../../../../utils/auth';
export const fetchFieldVerificationData = async id => {
  try {
    const token = await getToken();

    const response = await axios.post(
      WATER_APPLICATION_GET_FIELD_VERIFICATION_API,
      { id }, // body payload
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    // console.log('📦 Field Verification Data:', response.data.tcVerifiedData);
    // console.log(
    //   'Fetched Field Verification Data:',
    //   response.data.tcVerifiedData,
    // );
    return response.data;
  } catch (error) {
    console.error('Error fetching field verification data:', error);
    throw error;
  }
};
