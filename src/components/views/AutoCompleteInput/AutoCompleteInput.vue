<template>
  <div class="autocomplete">
    <h3>Выберите город</h3>
    <input
        type="text"
        v-model="query"
        @input="onInput"
        @keydown.down.prevent="onArrowDown"
        @keydown.up.prevent="onArrowUp"
        @keydown.enter.prevent="onEnter"
        placeholder="Введите название города"
        class="autocomplete__input"
    />
    <ul v-if="filteredCities.length" ref="citiesList" class="autocomplete__list">
      <li
          v-for="(city, index) in filteredCities"
          :key="city.id"
          :class="['autocomplete__item', { 'autocomplete__item--active': index === selectedIndex }]"
          @click="selectCity(city)"
          @mouseover="() => (selectedIndex = index)"
          ref="cityItems"
      >
        {{ city.name }}, {{ city.country }}
      </li>
    </ul>

    <div class="contacts">
      Мой телеграмм: @evgenuvld
    </div>

  </div>
</template>

<script lang="ts">

import { defineComponent, ref, computed, nextTick } from 'vue';
import debounce from 'lodash/debounce';
import { useCityStore } from '../../store/useCityStore';
import { City } from "@/components/api/api";

export default defineComponent({
  name: 'AutoCompleteInput',
  setup() {
    const query = ref('');
    const selectedIndex = ref(-1);
    const citiesList = ref<HTMLElement | null>(null);

    const cityStore = useCityStore();

    const filteredCities = computed(() => {
      if (!query.value) return [];
      const lowerCaseQuery = query.value.toLowerCase();

      // Хранение уникальных комбинаций
      const uniqueKeys = new Set<string>();

      return cityStore.cities
        //Фильтр на уникальность названия города или страны
        .filter(city => {
          const cityNameCountry = `${city.name.toLowerCase()}, ${city.country.toLowerCase()}`;
          if (cityNameCountry.includes(lowerCaseQuery) && !uniqueKeys.has(cityNameCountry)) {
            uniqueKeys.add(cityNameCountry);
            return true;
          }
          return false;
        })
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 10);
    });

    const scrollIntoView = () => {
      if (citiesList.value && selectedIndex.value >= 0) {
        const activeItem = citiesList.value.children[selectedIndex.value] as HTMLElement;
        if (activeItem) {
          activeItem.scrollIntoView({
            block: 'nearest',
            inline: 'start',
          });
        }
      }
    };

    const debouncedFetchCitySuggestions = debounce(() => {
      cityStore.fetchCitySuggestions(query.value);
    }, 300);

    const onInput = () => {
      debouncedFetchCitySuggestions();
    };

    const onArrowDown = async () => {
      if (selectedIndex.value < filteredCities.value.length - 1) {
        selectedIndex.value++;
        await nextTick();
        scrollIntoView();
      }
    };

    const onArrowUp = async () => {
      if (selectedIndex.value > 0) {
        selectedIndex.value--;
        await nextTick();
        scrollIntoView();
      }
    };

    const onEnter = () => {
      if (selectedIndex.value >= 0 && selectedIndex.value < filteredCities.value.length) {
        selectCity(filteredCities.value[selectedIndex.value]);
      }
    };

    const selectCity = (city: City) => {
      query.value = `${city.name}, ${city.country}`;
      cityStore.cities = [];
      selectedIndex.value = -1;
    };

    return {
      query,
      filteredCities,
      selectedIndex,
      onInput,
      onArrowDown,
      onArrowUp,
      onEnter,
      selectCity,
      citiesList,
    };
  },
});
</script>

<style scoped>
.autocomplete {
    opacity: 0;
    animation: slideIn 2s forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideIn {
    from {
        transform: translateY(-20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.autocomplete__input {
    width: 300px;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    transition: border-color 0.3s;

    &:focus {
        border-color: #007BFF;
    }
}


.autocomplete__list {
    list-style-type: none;
    padding: 0;
    margin-top: 8px;
    border: 1px solid #ddd;
    max-height: 250px;
    overflow-y: auto;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: max-height 0.3s ease;
    position: absolute;
    width: 100%;
    background-color: white;
    z-index: 1000;
}

.autocomplete__item {
    padding: 8px;
    cursor: pointer;
}

.autocomplete__item--active {
    background-color: #e0e0e0;
}

.contacts {
    margin-top: 50px;
}
</style>
