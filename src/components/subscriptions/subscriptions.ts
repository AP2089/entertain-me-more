import axios, { AxiosError } from 'axios';
import { Props, Item, Data } from './subscriptions.types';

export class Subscriptions {
  id: string;
  url: string;
  element: HTMLElement | null;
  form: HTMLFormElement | null | undefined;
  list: HTMLElement | null | undefined;
  loader: HTMLDivElement;
  progressScale: HTMLElement | null;
  progressCounter: HTMLElement | null;
  differenceAdd: HTMLElement | null | undefined;
  differenceRemove: HTMLElement | null | undefined;
  selectedDefalt: number;
  selectedCurrent: number;
  selectedLength: number;

  constructor(props: Props) {
    this.id = props.id;
    this.url = props.url;
    this.element = document.getElementById(this.id);
    this.form = this.element?.querySelector('form');
    this.list = this.element?.querySelector('.js-subscriptions-list');
    this.differenceAdd = this.element?.querySelector('.js-subscriptions-difference-add');
    this.differenceRemove = this.element?.querySelector('.js-subscriptions-difference-remove');
    this.progressScale = document.getElementById(props.progressScaleId);
    this.progressCounter = document.getElementById(props.progressCounterId);
    this.loader = this.getLoader();
    this.selectedDefalt = 0;
    this.selectedCurrent = 0;
    this.selectedLength = 0;

    this.fetch();
    
    this.form?.addEventListener('submit', (event: SubmitEvent) => {
      event.preventDefault();
      this.onSubmit(String(event.submitter?.dataset.submit));
    });

    if (!this.element) {
      console.error('Subscriptions selector not found');
    }
  }

  getLoader() {
    const loader = document.createElement('div');
    loader.classList.add('loader');
    
    return loader;
  }

  async fetch() {
    try {
      document.body.append(this.loader);

      const { data } = await axios.get<Item[]>(this.url);
      const items = data.map((item: Item) => {
        this.selectedLength += 1;

        if (item.subscribed) {
          this.selectedDefalt = this.selectedCurrent += 1;
        }

        return this.createItem(item);
      }).join('');

      if (this.list) {
        this.list.innerHTML = items;
        this.setSelectedCalc();

        this.element?.querySelectorAll<HTMLInputElement>('.js-subscriptions-checkbox').forEach((element) => {
          element.addEventListener('change', (event: Event) => {            
            const target = event.target as HTMLInputElement;

            this.selectedCurrent = target.checked ? this.selectedCurrent + 1 : this.selectedCurrent - 1;
            this.setSelectedCalc();
          });
        });
      }
    } catch (error) {
      console.error((error as AxiosError).message);
    } finally {
      this.loader.remove();
    }
  }

  onSubmit(payload: string) {
    const data: Data[] = [];

    this.form?.querySelectorAll<HTMLInputElement>('input[type=checkbox]').forEach((element) => {
      if (payload === 'unsubscribed') {
        element.checked = false;
      }

      data.push({
        site: element.value,
        subscribed: element.checked
      });
    });

    if (payload === 'subscribed') {
      this.selectedDefalt = this.selectedCurrent;
    }

    if (payload === 'unsubscribed') {
      this.selectedDefalt = this.selectedCurrent = 0;
    }

    this.setSelectedCalc();
    console.log(data);
  }

  selectedCalc(payload: number) {
    const value = payload / this.selectedLength * 100;

    return {
      value,
      integer: Math.floor(value)
    }
  }

  setSelectedCalc() {
    const progress = this.selectedCalc(this.selectedCurrent);
    const difference = this.selectedCalc(this.selectedDefalt);
    const differenceAddVal = progress.integer - difference.integer;
    const differenceAdd = differenceAddVal > 0 ? differenceAddVal : 0;
    const differenceRemove = difference.integer;

    this.progressScale!.style.transform = `translateX(${progress.value}%)`;
    this.progressCounter!.innerHTML = `${progress.integer}%`;
    this.differenceAdd!.innerHTML = `+${differenceAdd}%`;
    this.differenceRemove!.innerHTML = `-${differenceRemove}%`;
  }

  createItem(item: Item) {
    return `
      <div class="subscriptions__item">
        <picture class="subscriptions__picture">
          <source type="image/webp" srcset="${item.image.webp}" />
          <img src="${item.image.any}" alt="item.site" loading="lazy" class="subscriptions__img" height="82" />
        </picture>
        <div class="subscriptions__toggle">
          <label class="checkbox">
            <input type="checkbox" class="checkbox__input js-subscriptions-checkbox" value="${item.site}" ${item.subscribed ? 'checked' : ''} />
            <div class="checkbox__caption" data-subscribed="Subscribed" data-unsubscribed="Unsubscribed"></div>
            <div class="checkbox__toggle"></div>
          </label>
        </div>
        <div class="subscriptions__caption">${item.caption}</div>
      </div>
    `
  }
}

new Subscriptions({
  id: 'subscriptions',
  url: '/api/subscriptions.json',
  progressScaleId: 'subscriptions-progress-scale',
  progressCounterId: 'subscriptions-progress-counter'
});