import getScrollbarWidth from '@/scripts/utils/getScrollbarWidth';

export interface IModalProps {
  element: HTMLElement;
}

export type IModalToggleProps = 'show' | 'hide';

export class Modal {
  element: HTMLElement;
  modal: HTMLElement | null;
  elementsHide!: NodeListOf<HTMLElement>;
  modalHandler!: () => void;
  scrollbarWidth!: string;

  constructor(props: IModalProps) {
    this.element = props.element;
    this.modal = document.getElementById(String(this.element.dataset?.target));

    if (!this.modal) {
      console.error('Modal selector not found');
      return;
    }

    this.elementsHide = this.modal.querySelectorAll('.js-modal-hide');
    this.scrollbarWidth = getScrollbarWidth() + 'px';

    this.element.addEventListener('click', () => {
      this.toggleModal('show');
    });

    this.elementsHide.forEach(element => {
      element.addEventListener('click', () => {
        this.toggleModal('hide');
      });
    });    
  }

  toggleModal(value: IModalToggleProps) {
    if (value === 'show') {
      document.body.style.paddingRight = this.scrollbarWidth;
      document.body.style.overflow = 'hidden';
      this.modal?.classList.add('active');
    } else {
      document.body.style.paddingRight = '';
      document.body.style.overflow = '';
      this.modal?.classList.remove('active');
    }
  }
}

document.querySelectorAll<HTMLElement>('.js-modal').forEach(element => {
  new Modal({
    element
  });
});