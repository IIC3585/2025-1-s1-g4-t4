const sectionTemplateWC = document.createElement('template');
sectionTemplateWC.innerHTML = `
    <style>
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
        /* Rotación se aplica si icon-open no está definido y se usa el default */
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
    </style>
    <div class="header" part="header">
        <div class="title-container" part="title-container">
        <slot name="title">
            <span class="default-title-text">Section</span>
        </slot>
        </div>
        <div class="icon" part="icon"></div>
    </div>
    <div class="content" part="content">
        <slot></slot>
    </div>
`;

class AccordionSectionWC extends HTMLElement {
    static get observedAttributes() {
        return ['open', 'title', 'icon-closed', 'icon-open'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(sectionTemplateWC.content.cloneNode(true));
        this._header = this.shadowRoot.querySelector('.header');
        this._content = this.shadowRoot.querySelector('.content');
        this._iconElement = this.shadowRoot.querySelector('.icon');
        this._titleSlot = this.shadowRoot.querySelector('slot[name="title"]');
        this._defaultTitleTextElement = this.shadowRoot.querySelector('.default-title-text');
    }

    connectedCallback() {
        this._header.addEventListener('click', this._toggleOpen.bind(this));
        this._updateTitle();
        this._updateIcon();
        if (this.hasAttribute('open')) {
            this._updateOpenState(false); 
        }
    }

    disconnectedCallback() {
        this._header.removeEventListener('click', this._toggleOpen);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        switch (name) {
        case 'open':
            this._updateOpenState();
            this._updateIcon();
            break;
        case 'title':
            this._updateTitle();
            break;
        case 'icon-closed':
        case 'icon-open':
            this._updateIcon();
            break;
        }
    }

    _updateTitle() {
        const titleAttr = this.getAttribute('title');
        const hasSlottedTitle = this._titleSlot.assignedNodes().some(n => n.nodeType === Node.ELEMENT_NODE || (n.nodeType === Node.TEXT_NODE && n.textContent.trim()));

        if (this._defaultTitleTextElement) {
            if (hasSlottedTitle) {
            this._defaultTitleTextElement.style.display = 'none';
            } else {
            this._defaultTitleTextElement.textContent = titleAttr || 'Section';
            this._defaultTitleTextElement.style.display = 'inline';
            }
        }
    }

    _updateIcon() {
        const iconOpenAttr = this.getAttribute('icon-open');
        const iconClosedAttr = this.getAttribute('icon-closed') || '▶';
        
        this._iconElement.classList.remove('rotate'); 

        if (this.open && iconOpenAttr) {
        this._iconElement.textContent = iconOpenAttr;
        } else {
        this._iconElement.textContent = iconClosedAttr;
        if (this.open && !iconOpenAttr) { 
            this._iconElement.classList.add('rotate');
        }
        }
    }

    _toggleOpen() {
        this.open = !this.open;
    }

    get open() {
        return this.hasAttribute('open');
    }

    set open(isOpen) {
        const currentlyOpen = this.hasAttribute('open');
        if (currentlyOpen === isOpen) return;

        if (isOpen) {
        this.setAttribute('open', '');
        } else {
        this.removeAttribute('open');
        }
        this.dispatchEvent(new CustomEvent('section-toggle', {
        bubbles: true,
        composed: true,
        detail: { open: this.open, target: this, headerElement: this._header }
        }));
    }

    _updateOpenState(animate = true) {
        const duration = animate ? (parseFloat(getComputedStyle(this).getPropertyValue('--accordion-transition-duration') || '0.35') * 1000) : 0;
        
        if (this.open) {
        this._content.style.display = 'block'; 
        requestAnimationFrame(() => {
            this._content.style.maxHeight = this._content.scrollHeight + 'px';
        });
        } else {
        this._content.style.maxHeight = '0';
        }
    }
    }
customElements.define('accordion-section-wc', AccordionSectionWC);

const accordionWrapperTemplateWC = document.createElement('template');
accordionWrapperTemplateWC.innerHTML = `
    <style>:host { display: block; }</style>
    <slot></slot>
`;

class AccordionWC extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(accordionWrapperTemplateWC.content.cloneNode(true));
    }

    get scrollToOpen() {
        return this.hasAttribute('scroll-to-open');
    }

    connectedCallback() {
        this.shadowRoot.addEventListener('section-toggle', this._handleSectionToggle.bind(this));
        requestAnimationFrame(() => this._initializeSections());
    }

    disconnectedCallback() {
        this.shadowRoot.removeEventListener('section-toggle', this._handleSectionToggle);
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
        return slot ? slot.assignedNodes({ flatten: true }).filter(node => node instanceof AccordionSectionWC) : [];
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
}
customElements.define('accordion-wc', AccordionWC);