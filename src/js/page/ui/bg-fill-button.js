import FloatingActionButton from './floating-action-button.js';

export default class BgFillButton extends FloatingActionButton {
  constructor() {
    const title = 'Preview on vivid background';

    super({
      title,
      iconSvg:
        // prettier-ignore
        '<svg aria-hidden="true" class="icon" viewBox="0 0 24 24">' +
          '<path fill="currentColor" d="M21.143 9.667c-.733-1.392-1.914-3.05-3.617-4.753C14.549 1.936 12.048 1 10.741 1c-.414 0-.708.094-.86.246L8.52 2.606c-1.899-.236-3.42.106-4.294.983-.876.875-1.164 2.159-.792 3.523.492 1.806 2.305 4.049 5.905 5.375.038.323.157.638.405.885.588.588 1.535.586 2.121 0s.588-1.533.002-2.119a1.5 1.5 0 0 0-2.123-.001l-.17.256c-2.031-.765-3.395-1.828-4.232-2.9l3.879-3.875c.496 2.73 6.432 8.676 9.178 9.178l-7.115 7.107c-.234.153-2.798-.316-6.156-3.675-3.393-3.393-3.175-5.271-3.027-5.498L3.96 9.989C3.521 9.63 3.035 8.886 2.819 8.3L.685 10.431C.24 10.877 0 11.495 0 12.251c0 1.634 1.121 3.915 3.713 6.506C6.477 21.521 9.293 23 11.145 23c.648 0 1.18-.195 1.547-.562l8.086-8.078c.91.874-.778 3.538-.778 4.648a2 2 0 0 0 4-.001c0-3.184-1.425-6.81-2.857-9.34zM4.934 4.296c.527-.53 1.471-.791 2.656-.761L4.381 6.741c-.236-.978-.049-1.845.553-2.445zm9.292 4.079-.03-.029C12.904 7.054 10.393 3.99 11.1 3.283c.715-.715 3.488 1.521 5.062 3.096.862.862 2.088 2.247 2.937 3.458-1.717-1.074-3.491-1.469-4.873-1.462z"/>' +
        '</svg>',
    });
  }

  onClick(event) {
    super.onClick(event);

    if (this.container.classList.contains('active')) {
      this.container.classList.remove('active');
      document.documentElement.classList.remove('bg-dark');
    } else {
      this.container.classList.add('active');
      document.documentElement.classList.add('bg-dark');
    }
  }
}
