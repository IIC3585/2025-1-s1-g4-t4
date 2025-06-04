import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class AccordionSectionLit extends LitElement {
    static properties = {
        title: { type: String },
        open: { type: Boolean, reflect: true },
        iconClosed: { type: String, attribute: 'icon-closed' },
        iconOpen: { type: String, attribute: 'icon-open' },
    };

    static styles = css`
        :host {
        display: block;
        border: 1px solid var(--accordion-section-border-color, #ccc);
        border-top: none;
        }
        :host(:first-of-type) {
        border-top: 1px solid var(--accordion-section-border-color, #ccc);
        border-top-left-radius: var(--accordion-section-border-radius, 3px);
        border-top-right-radius: var(--accordion-section-border-radius, 3px);
        }
        :host(:last-of-type) {
        border-bottom-left-radius: var(--accordion-section-border-radius, 3px);
        border-bottom-right-radius: var(--accordion-section-border-radius, 3px);
        }
        :host(:first-of-type:last-of-type) {
            border-radius: var(--accordion-section-border-radius, 3px);
        }
        .header {
        background-color: var(--accordion-section-header-bg, #f1f1f1);
        color: var(--accordion-section-header-color, #333);
        padding: var(--accordion-section-header-padding, 12px 18px);
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        user-select: none;
        transition: background-color 0.2s ease-out;
        }
        .header:hover {
        background-color: var(--accordion-section-header-hover-bg, #e0e0e0);
        }
        .title-container {
        flex-grow: 1;
        }
        .icon {
        font-size: 1.1em;
        color: var(--accordion-icon-color, inherit);
        margin-left: 10px;
        flex-shrink: 0;
        transition: transform var(--accordion-transition-duration, 0.35s) var(--accordion-transition-timing-function, ease-in-out);
        }
        :host([open]) .icon.rotate {
        transform: rotate(90deg);
        }
        .content {
        background-color: var(--accordion-section-content-bg, #fff);
        color: var(--accordion-section-content-color, #333);
        padding: 0 var(--accordion-section-content-padding-x, 18px);
        max-height: 0;
        overflow: hidden;
        transition: max-height var(--accordion-transition-duration, 0.35s) var(--accordion-transition-timing-function, cubic-bezier(0.4, 0, 0.2, 1)), 
                    padding var(--accordion-transition-duration, 0.35s) var(--accordion-transition-timing-function, cubic-bezier(0.4, 0, 0.2, 1));
        }
        :host([open]) .content {
        padding-top: var(--accordion-section-content-padding-y, 15px);
        padding-bottom: var(--accordion-section-content-padding-y, 15px);
        }
    `;

    constructor() {
        super();
        this.title = 'Section';
        this.open = false;
        this.iconClosed = '▶'; 
    }

  _getIconContent() {
    if (this.open && this.iconOpen) {
      return this.iconOpen;
    }
    return this.iconClosed;
  }

     _getIconClass() {
        return (this.open && !this.iconOpen) ? 'icon rotate' : 'icon';
    }

    _toggleOpen() {
        const oldOpen = this.open;
        this.open = !this.open;
        if (this.open !== oldOpen) {
            this.dispatchEvent(new CustomEvent('section-toggle', {
                bubbles: true,
                composed: true,
                detail: { open: this.open, target: this, headerElement: this.shadowRoot.querySelector('.header') }
            }));
        }
    }

    updated(changedProperties) {
        if (changedProperties.has('open')) {
            const contentElement = this.shadowRoot.querySelector('.content');
            if (this.open) {
            requestAnimationFrame(() => {
                contentElement.style.maxHeight = contentElement.scrollHeight + 'px';
            });
            } else {
                contentElement.style.maxHeight = '0px';
        }
        }
    }

    render() {
        return html`
            <div class="header" @click=${this._toggleOpen} part="header">
                <div class="title-container" part="title-container">
                <slot name="title">${this.title}</slot>
                </div>
                <div class="${this._getIconClass()}" part="icon">${this._getIconContent()}</div>
            </div>
            <div class="content" part="content">
                <slot></slot>
            </div>
        `;
    }
    }
customElements.define('accordion-section-lit', AccordionSectionLit);

class AccordionLit extends LitElement {
    static properties = {
        scrollToOpen: { type: Boolean, attribute: 'scroll-to-open' },
    };

    static styles = css`
        :host { display: block; }
    `;

    constructor() {
        super();
        this.scrollToOpen = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('section-toggle', this._handleSectionToggle);
        requestAnimationFrame(() => this._initializeSections());
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('section-toggle', this._handleSectionToggle);
    }
    
    _initializeSections() {
        const sections = this._getSections();
        let firstOpenSection = null;
        sections.forEach(section => {
            if (section.open) {
                if (!firstOpenSection) {
                    firstOpenSection = section;
                } else {
                    section.open = false; 
                }
            }
        });
    }

    _getSections() {
        const slot = this.shadowRoot.querySelector('slot');
        return slot ? slot.assignedNodes({ flatten: true }).filter(node => node instanceof AccordionSectionLit) : [];
    }

    _handleSectionToggle(event) {
        const toggledSection = event.detail.target;
        const isOpen = event.detail.open;
        const headerElement = event.detail.headerElement;


        if (isOpen) {
        this._getSections().forEach(section => {
            if (section !== toggledSection && section.open) {
            section.open = false; 
            }
        });
        if (this.scrollToOpen && headerElement) {
            const style = getComputedStyle(toggledSection);
            const animationDurationString = style.getPropertyValue('--accordion-transition-duration').trim() || '0.35s';
            
            let delay = 350; 
            if (animationDurationString) {
                if (animationDurationString.endsWith('ms')) {
                    delay = parseFloat(animationDurationString);
                } else if (animationDurationString.endsWith('s')) {
                    delay = parseFloat(animationDurationString) * 1000;
                } else if (!isNaN(parseFloat(animationDurationString))) {
                    delay = parseFloat(animationDurationString) * 1000;
                }
            }
                        
            setTimeout(() => {
                headerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, delay);
        }
        }
    }

    render() {
        return html`<slot @slotchange=${this._initializeSections}></slot>`;
    }
}
customElements.define('accordion-lit', AccordionLit);