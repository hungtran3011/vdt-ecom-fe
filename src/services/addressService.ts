import { API_BASE_URL } from '@/lib/config';

export interface Province {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  phone_code: number;
  short_codename: string;
}

export interface District {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  short_codename: string;
}

export interface Ward {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  short_codename: string;
}

export class AddressService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/v1/address`;
  }

  async getProvinces(): Promise<Province[]> {
    try {
      const response = await fetch(`${this.baseUrl}/provinces`);
      if (!response.ok) {
        throw new Error(`Failed to fetch provinces: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error;
    }
  }

  async getDistricts(provinceCode: number): Promise<District[]> {
    try {
      const response = await fetch(`${this.baseUrl}/provinces/${provinceCode}/districts`);
      if (!response.ok) {
        throw new Error(`Failed to fetch districts: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
  }

  async getWards(districtCode: number): Promise<Ward[]> {
    try {
      const response = await fetch(`${this.baseUrl}/districts/${districtCode}/wards`);
      if (!response.ok) {
        throw new Error(`Failed to fetch wards: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching wards:', error);
      throw error;
    }
  }
}
