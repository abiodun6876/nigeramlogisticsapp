import { FuelData } from '../types';

export class FuelPriceService {
  private readonly NNPC_API_URL = 'https://api.nnpcgroup.com/fuel-prices'; // Mock URL
  private readonly FALLBACK_PRICE = 750; // Naira per liter

  async getCurrentFuelPrice(): Promise<FuelData> {
    try {
      // In a real implementation, this would fetch from NNPC API
      // For now, we'll simulate real-time pricing with some variation
      const basePrice = this.FALLBACK_PRICE;
      const variation = (Math.random() - 0.5) * 50; // ±25 Naira variation
      const currentPrice = Math.round(basePrice + variation);

      return {
        pricePerLiter: currentPrice,
        currency: 'NGN',
        lastUpdated: new Date().toISOString(),
        source: 'NNPC Retail'
      };
    } catch (error) {
      console.warn('Failed to fetch real-time fuel price, using cached data');
      return this.getCachedFuelPrice();
    }
  }

  private getCachedFuelPrice(): FuelData {
    const cached = localStorage.getItem('fuel_price_cache');
    if (cached) {
      const data = JSON.parse(cached);
      // Check if cache is less than 1 hour old
      if (new Date().getTime() - new Date(data.lastUpdated).getTime() < 3600000) {
        return data;
      }
    }

    // Return default price if no valid cache
    const defaultData: FuelData = {
      pricePerLiter: this.FALLBACK_PRICE,
      currency: 'NGN',
      lastUpdated: new Date().toISOString(),
      source: 'Cached'
    };

    localStorage.setItem('fuel_price_cache', JSON.stringify(defaultData));
    return defaultData;
  }

  async updateFuelPriceCache(): Promise<void> {
    const currentPrice = await this.getCurrentFuelPrice();
    localStorage.setItem('fuel_price_cache', JSON.stringify(currentPrice));
  }
}