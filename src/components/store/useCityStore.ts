import { defineStore } from 'pinia';
import { City, fetchCities } from '../api/api';

export const useCityStore = defineStore('cityStore', {
  state: () => ({
    cities: [] as City[],
    cache: {} as Record<string, City[]>
  }),
  actions: {
    async fetchCitySuggestions(query: string) {
      if (query.length < 2) {
        this.cities = [];
        return;
      }
      //Закешированные результаты для запроса
      if (this.cache[query]) {
        this.cities = this.cache[query];
        return;
      }

      const trimmedQuery = query.trim();
      const results = await fetchCities(trimmedQuery);
      this.cities = results;
      this.cache[trimmedQuery] = results;
    }
  }
});
