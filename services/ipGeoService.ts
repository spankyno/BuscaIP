import { GeoData } from '../types';

// This is the raw response structure from the new ipwho.is API
interface IpwhoResponse {
  success: boolean;
  message?: string;
  ip: string;
  country: string;
  country_code: string;
  region: string; // This is the full region name
  region_code: string; // This is the region code
  city: string;
  latitude: number;
  longitude: number;
  postal: string;
  connection: {
    asn: number;
    org: string;
    isp: string;
  };
  timezone: {
    id: string;
  };
}

/**
 * Adapts the response from the ipwho.is API to our internal GeoData structure.
 * This prevents having to change the rest of the application.
 * @param {IpwhoResponse} data - The raw data from the ipwho.is API.
 * @returns {GeoData} The adapted data object.
 */
const adaptIpwhoResponseToGeoData = (data: IpwhoResponse): GeoData => {
  return {
    status: data.success ? 'success' : 'fail',
    message: data.message,
    query: data.ip,
    country: data.country,
    countryCode: data.country_code,
    region: data.region_code,
    regionName: data.region,
    city: data.city,
    zip: data.postal,
    lat: data.latitude,
    lon: data.longitude,
    timezone: data.timezone.id,
    isp: data.connection.isp,
    org: data.connection.org,
    as: `AS${data.connection.asn}`,
  };
};

export const getGeoData = async (ipAddress: string = ''): Promise<GeoData> => {
  try {
    // Using the new, more reliable ipwho.is service
    const response = await fetch(`https://ipwho.is/${ipAddress}`);
    const data: IpwhoResponse = await response.json();

    // The new API indicates errors within the JSON response body
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch IP data');
    }

    return adaptIpwhoResponseToGeoData(data);
  } catch (error) {
    console.error('Error fetching geo data:', error);
    // If the fetch itself fails, it's a network issue.
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Could not connect to the geolocation service.');
    }
    // Re-throw other errors to be displayed in the UI
    throw error;
  }
};