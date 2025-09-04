import MicroModal from 'micromodal';

export interface ModalOptions {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  buttonText?: string;
}

class ModalService {
  private static instance: ModalService;

  private constructor() {}

  public static getInstance(): ModalService {
    if (!ModalService.instance) {
      ModalService.instance = new ModalService();
    }
    return ModalService.instance;
  }

  /**
   * Initialize MicroModal
   */
  init() {
    if (typeof window !== 'undefined') {
      MicroModal.init({
        onShow: (modal) => console.log('Modal opened:', modal.id),
        onClose: (modal) => console.log('Modal closed:', modal.id),
        openTrigger: 'data-micromodal-trigger',
        closeTrigger: 'data-micromodal-close',
        disableScroll: true,
        disableFocus: false,
        awaitCloseAnimation: true,
        debugMode: false
      });
    }
  }

  /**
   * Show a modal with the provided options
   */
  show(modalId: string, options: ModalOptions) {
    if (typeof window === 'undefined') return;

    const modal = document.getElementById(modalId);
    if (!modal) {
      console.error(`Modal with ID "${modalId}" not found`);
      return;
    }

    // Update modal content
    this.updateModalContent(modal, options);

    // Show modal
    MicroModal.show(modalId);
  }

  /**
   * Show success modal
   */
  showSuccess(title: string, message: string, buttonText: string = 'Entendido') {
    this.show('response-modal', {
      title,
      message,
      type: 'success',
      buttonText
    });
  }

  /**
   * Show error modal
   */
  showError(title: string, message: string, buttonText: string = 'Entendido') {
    this.show('response-modal', {
      title,
      message,
      type: 'error',
      buttonText
    });
  }

  /**
   * Show info modal
   */
  showInfo(title: string, message: string, buttonText: string = 'Entendido') {
    this.show('response-modal', {
      title,
      message,
      type: 'info',
      buttonText
    });
  }

  /**
   * Close a modal
   */
  close(modalId: string) {
    if (typeof window === 'undefined') return;
    MicroModal.close(modalId);
  }

  /**
   * Update modal content
   */
  private updateModalContent(modal: HTMLElement, options: ModalOptions) {
    const { title, message, type = 'info', buttonText = 'Entendido' } = options;

    // Update title
    const titleElement = modal.querySelector('.modal__title-text');
    if (titleElement) {
      titleElement.textContent = title;
    }

    // Update icon
    const iconElement = modal.querySelector('.modal__icon');
    if (iconElement) {
      // Remove previous type classes
      iconElement.classList.remove('success', 'error', 'info');
      iconElement.classList.add(type);
    }

    // Update message
    const messageElement = modal.querySelector('.modal__message');
    if (messageElement) {
      messageElement.textContent = message;
    }

    // Update button text
    const buttonElement = modal.querySelector('.modal__btn-primary');
    if (buttonElement) {
      buttonElement.textContent = buttonText;
    }
  }
}

// Export singleton instance
export const modalService = ModalService.getInstance();