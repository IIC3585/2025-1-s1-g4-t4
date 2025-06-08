const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      background: var(--suscripcion-bg, #fff);
      color: var(--suscripcion-color, #333);
      font-family: Arial, sans-serif;
      margin: 8px 0;
      box-sizing: border-box;
      max-width: 320px;
    }
    .plan {
      padding: var(--suscripcion-header-padding, 16px 18px);
      background: var(--plan-bg, #f9f9f9);
      text-align: center;
      border: 1px solid #ddd;
      border-radius: 8px;
      text-align: center;
      width: 240px;
      margin: 8px;
      font-family: Arial, sans-serif;
    }
    .plan-title {
      font-size: 1.2em;
      font-weight: bold;
      color: var(--suscripcion-header-color, #333);
      margin-bottom: 4px;
    }
    .plan-visits {
      font-size: 1em;
      color: var(--suscripcion-visits-color, #666);
      margin-bottom: 8px;
    }
    .plan-price {
      font-size: 1.8em;
      margin: 8px 0;
      color: var(--suscripcion-price-color, #222);
    }
    .features {
      text-align: left;
      margin: 12px 0;
      padding-left: 18px;
      color: var(--suscripcion-features-color, #444);
    }
    button {
      background-color: var(--suscripcion-btn-bg, #f1f1f1);
      color: var(--suscripcion-btn-color, #333);
      border: 1px solid var(--suscripcion-btn-border-color, #ccc);
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
      font-size: 1em;
      margin-top: 8px;
    }
    button:hover {
      background-color: var(--suscripcion-btn-hover-bg, #e0e0e0);
    }
  </style>
  <div class="plan">
    <div class="plan-title"><slot name="title"></slot></div>
    <div class="plan-visits"><slot name="visits"></slot></div>
    <div class="plan-price">$<slot name="price"></slot></div>
    <button>Seleccionar opción</button>
    <ul class="features"></ul>
  </div>
`;

class SuscripcionComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    const title = this.getAttribute('title');
    const visits = this.getAttribute('visits');
    const price = this.getAttribute('price');
    const features = this.getAttribute('features');

    if (title) {
      this.shadowRoot.querySelector('.plan-title').textContent = title;
    }
    if (visits) {
      this.shadowRoot.querySelector('.plan-visits').textContent = `${visits} monthly visits`;
    }
    if (price) {
      this.shadowRoot.querySelector('.plan-price').textContent = `$${price} / mo`;
    }

    const featuresList = this.shadowRoot.querySelector('.features');
    features.split(',').forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.trim();
      featuresList.appendChild(li);
    });

    // Get title from slot if available, otherwise fallback to attribute or textContent
    let planTitle = title;
    const titleSlot = this.shadowRoot.querySelector('slot[name="title"]');
    if (titleSlot) {
      const assignedNodes = titleSlot.assignedNodes().filter(n => n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.TEXT_NODE);
      if (assignedNodes.length > 0) {
        planTitle = assignedNodes.map(n => n.textContent).join('').trim();
      }
    }

    this.shadowRoot.querySelector('button').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('suscripcion-click', {
        detail: { plan: planTitle },
        bubbles: true
      }));
    });
  }
}

customElements.define('suscripcion-component', SuscripcionComponent);
