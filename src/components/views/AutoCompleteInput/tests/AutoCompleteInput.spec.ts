import { mount } from '@vue/test-utils';
import AutoCompleteInput from '@/components/views/AutoCompleteInput/AutoCompleteInput.vue';
import { useCityStore } from '@/components/store/useCityStore';

jest.mock('@/components/store/useCityStore');

// Мок scrollIntoView
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: jest.fn(),
  writable: true,
});

describe('AutoCompleteInput.vue', () => {
  const fetchCitySuggestionsMock = jest.fn();
  const cities = [
    { id: '1', name: 'Moscow', city: 'Moscow', country: 'Russia' },
    { id: '2', name: 'New York', city: 'New York', country: 'United States of America' },
    { id: '3', name: 'Dubai', city: 'Dubai', country: 'United Arab Emirates' }
  ];

  beforeEach(() => {
    (useCityStore as unknown as jest.Mock).mockReturnValue({
      fetchCitySuggestions: fetchCitySuggestionsMock,
      cities,
    });
    fetchCitySuggestionsMock.mockClear();
  });

  it('должен отображать список предложений при вводе текста', async () => {
    const wrapper = mount(AutoCompleteInput);
    const input = wrapper.find('input');

    await input.setValue('Mo');
    await wrapper.vm.$nextTick();

    const items = wrapper.findAll('li');
    expect(items).toHaveLength(1);
    expect(items[0].text()).toBe('Moscow, Russia');
  });

  it('должен обновлять список предложений по мере ввода', async () => {
    const wrapper = mount(AutoCompleteInput);
    const input = wrapper.find('input');

    await input.setValue('New');
    await wrapper.vm.$nextTick();

    let items = wrapper.findAll('li');
    expect(items).toHaveLength(1);
    expect(items[0].text()).toBe('New York, United States of America');

    await input.setValue('Du');
    await wrapper.vm.$nextTick();

    items = wrapper.findAll('li');
    expect(items).toHaveLength(1);
    expect(items[0].text()).toBe('Dubai, United Arab Emirates');
  });

  it('должен позволять выбирать элемент списка стрелками и нажатием Enter', async () => {
    const wrapper = mount(AutoCompleteInput);
    const input = wrapper.find('input');

    await input.setValue('Mo');
    await wrapper.vm.$nextTick();

    await input.trigger('keydown.down');
    await input.trigger('keydown.enter');

    expect(input.element.value).toBe('Moscow, Russia');
  });

  it('не должен делать запросы для строки меньшей минимальной длины', async () => {
    const wrapper = mount(AutoCompleteInput);
    const input = wrapper.find('input');
    const mockCallCountBefore = fetchCitySuggestionsMock.mock.calls.length;

    await input.setValue('M');
    expect(fetchCitySuggestionsMock).toHaveBeenCalledTimes(mockCallCountBefore);
  });

  it('должен очищать список предложений после выбора', async () => {
    const wrapper = mount(AutoCompleteInput);
    const input = wrapper.find('input');

    await input.setValue('Mo');
    await wrapper.vm.$nextTick();

    const items = wrapper.findAll('li');
    await items[0].trigger('click');

    expect(wrapper.findAll('li')).toHaveLength(0);
  });
});
