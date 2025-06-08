const template = document.createElement('template');
template.innerHTML = `
  <style>
    .plan {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      width: 240px;
      margin: 8px;
      font-family: Arial, sans-serif;
    }
    .plan-title {
      font-size: 1.2em;
      font-weight: bold;
    }
    .plan-price {
      font-size: 1.8em;
      margin: 8px 0;
    }
    .features {
      text-align: justify;
    }
    button {
      background-color: #000;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
  <div class="plan">
    <div class="plan-title"></div>
    <div class="plan-visits"></div>
    <div class="plan-price"></div>
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

    this.shadowRoot.querySelector('.plan-title').textContent = title;
    this.shadowRoot.querySelector('.plan-visits').textContent = `${visits} monthly visits`;
    this.shadowRoot.querySelector('.plan-price').textContent = `$${price} / mo`;

    const featuresList = this.shadowRoot.querySelector('.features');
    features.split(',').forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.trim();
      featuresList.appendChild(li);
    });

    this.shadowRoot.querySelector('button').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('suscripcion-click', {
        detail: { plan: title },
        bubbles: true
      }));
    });
  }
}

customElements.define('suscripcion-component', SuscripcionComponent);
