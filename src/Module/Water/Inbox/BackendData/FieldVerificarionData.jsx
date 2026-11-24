// src/hooks/useWaterMasterData.js
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getToken } from '../../../../utils/auth';
import {
  WATER_APPLICATION_MASTER_DATA_API,
  WATER_APPLICATION_FIELD_VERIFICATION_API,
  NEW_WARD_BY_OLD_API,
} from '../../../../api/apiRoutes';

export const useWaterMasterData = () => {
  const [ownershipType, setOwnershipType] = useState([]);
  const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);
  const [connectionType, setConnectionType] = useState([]);
  const [categoryTypeOptions, setCategoryTypeOptions] = useState([]);
  const [pipelineTypeOptions, setPipelineTypeOptions] = useState([]);
  const [connectionThrough, setConnectionThrough] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);
  const [newWardOptions, setNewWardOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMap, setSelectedMap] = useState(null);
  const [tsMapOptions, setTsMapOptions] = useState([]);
  const [ferruleType, setFerruleType] = useState([]);
  const [tcVerification, setTcVerification] = useState([]);

  const [error, setError] = useState(null);
  const [distributedPipelineTypeOptions, setDistributedPipelineTypeOptions] =
    useState([]);
  const [permittedPipeDiameterOptions, setPermittedPipeDiameterOptions] =
    useState([]);
  const [permittedPipeQualityOptions, setPermittedPipeQualityOptions] =
    useState([]);
  const [roadTypeOptions, setRoadTypeOptions] = useState([]);

  // ✅ Fetch new wards by old ward ID (memoized)
  const fetchNewWardByOldWard = useCallback(async oldWardId => {
    if (!oldWardId) return;
    try {
      const token = await getToken();
      const response = await axios.post(
        NEW_WARD_BY_OLD_API,
        { oldWardId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('🔹 New ward data:', response?.data?.data);

      if (response?.data?.status && Array.isArray(response?.data?.data)) {
        setNewWardOptions(
          response.data.data.map(item => ({
            label: item.wardNo,
            value: item.id,
          })),
        );
      } else {
        setNewWardOptions([]);
      }
    } catch (error) {
      console.error('❌ Error fetching new ward:', error);
      setNewWardOptions([]);
    }
  }, []);

  // ✅ Fetch master data once
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const response = await axios.post(
          WATER_APPLICATION_MASTER_DATA_API,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (response?.data?.status) {
          const masterData = response.data.data;
          console.log('📦 Water Master Data:', masterData);

          setOwnershipType(
            masterData?.ownershipType?.map(item => ({
              label: item.ownershipType,
              value: item.id,
            })) || [],
          );

          setPropertyTypeOptions(
            masterData?.propertyType?.map(item => ({
              label: item.propertyType,
              value: item.id,
            })) || [],
          );

          setConnectionType(
            masterData?.connectionType?.map(item => ({
              label: item.connectionType,
              value: item.id,
            })) || [],
          );

          setCategoryTypeOptions(
            masterData?.categoryType?.map(item => ({
              label: item,
              value: item,
            })) || [],
          );

          setPipelineTypeOptions(
            masterData?.pipelineType?.map(item => ({
              label: item.pipelineType,
              value: item.id,
            })) || [],
          );

          setConnectionThrough(
            masterData?.connectionThrow?.map(item => ({
              label: item.connectionThrough,
              value: item.id,
            })) || [],
          );

          setWardOptions(
            masterData?.wardList?.map(item => ({
              label: item.wardNo,
              value: item.id,
            })) || [],
          );
          setDistributedPipelineTypeOptions(
            masterData?.distributedPipelineType?.map(item => ({
              label: item,
              value: item,
            })) || [],
          );

          setPermittedPipeDiameterOptions(
            masterData?.permittedPipeDiameter?.map(item => ({
              label: item,
              value: item,
            })) || [],
          );

          setPermittedPipeQualityOptions(
            masterData?.permittedPipeQuality?.map(item => ({
              label: item,
              value: item,
            })) || [],
          );
          setRoadTypeOptions(
            masterData?.roadType?.map(item => ({
              label: item,
              value: item,
            })) || [],
          );
          setFerruleType(
            masterData?.ferruleType?.map(item => ({
              label: item.ferruleType, // 👈 extract the string value
              value: item.id, // 👈 use ID or ferruleType depending on your logic
            })) || [],
          );

          setTsMapOptions(
            masterData?.tsMap?.map(item => ({
              label: item.name, // For dropdown display
              value: item.id, // For selection value
              img: item.img, // Image URL for reference
            })) || [],
          );

          // setTcVerification
          // console.log('ts map options', tsMapOptions);
        } else {
          console.warn('⚠️ Master data response invalid:', response?.data);
        }
      } catch (err) {
        console.error('❌ Error fetching master data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMasterData();
  }, []);

  const fetchVarification = async paylod => {
    if (!paylod) return;
    console.log('Fetching verification for ID:', paylod);
    try {
      const token = await getToken(); // Get stored auth token

      const response = await axios.post(
        WATER_APPLICATION_FIELD_VERIFICATION_API, // ✅ API endpoint
        { paylod }, // ✅ Request body
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Add token
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data?.success) {
        console.log('Verification Data:', response.data.tcVerification);
        return response.data; // ✅ Return data for further use
      } else {
        console.warn('API did not return success:', response.data);
        return null;
      }
    } catch (error) {
      console.error('Error fetching verification data:', error);
      return null;
    }
  };

  return {
    ferruleType,
    tsMapOptions,
    ownershipType,
    propertyTypeOptions,
    connectionType,
    categoryTypeOptions,
    pipelineTypeOptions,
    connectionThrough,
    wardOptions,
    newWardOptions,
    roadTypeOptions,
    distributedPipelineTypeOptions, // ✅ Added
    permittedPipeDiameterOptions, // ✅ Added
    permittedPipeQualityOptions,
    fetchNewWardByOldWard,
    fetchVarification,
    loading,
    error,
  };
};
