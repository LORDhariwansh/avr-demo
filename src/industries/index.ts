import { healthcareConfig } from './healthcare';
import { realEstateConfig } from './realEstate';
import { educationConfig } from './education';
import { manufacturingConfig } from './manufacturing';
import { retailConfig } from './retail';
import { hospitalityConfig } from './hospitality';
import { restaurantConfig } from './restaurant';
import { automotiveConfig } from './automotive';
import { professionalServicesConfig } from './professionalServices';
import { logisticsConfig } from './logistics';
import type { Industry, IndustryConfig } from '../types';

export const industriesConfig: Record<Industry, IndustryConfig> = {
  'Healthcare': healthcareConfig,
  'Real Estate': realEstateConfig,
  'Education': educationConfig,
  'Manufacturing': manufacturingConfig,
  'Retail & E-commerce': retailConfig,
  'Hospitality': hospitalityConfig,
  'Restaurants': restaurantConfig,
  'Automotive': automotiveConfig,
  'Professional Services': professionalServicesConfig,
  'Logistics': logisticsConfig,
};

export const getIndustryConfig = (industry: Industry): IndustryConfig => {
  return industriesConfig[industry];
};
