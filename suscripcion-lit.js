import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

export class SuscripcionLit extends LitElement {
    static properties = {
        title: { type: String },
        visits: { type: String },
        price: { type: String },
        features: { type: String }
    };

    static styles = css`
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
    `;

    constructor() {
        super();
        this.title = '';
        this.visits = '';
        this.price = '';
        this.features = '';
    }

    _onClick() {
        let planTitle = this.title || '';
        const titleSlot = this.shadowRoot.querySelector('slot[name="title"]');
        if (titleSlot) {
            const assignedNodes = titleSlot.assignedNodes().filter(n => n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.TEXT_NODE);
            if (assignedNodes.length > 0) {
                planTitle = assignedNodes.map(n => n.textContent).join('').trim();
            }
        }
        this.dispatchEvent(new CustomEvent('suscripcion-click', {
            detail: { plan: planTitle },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        const featuresArr = this.features
            ? this.features.split(',').map(f => f.trim()).filter(f => f)
            : [];

        return html`
            <div class="plan">
            <div class="plan-title">
                ${this.title ? this.title : html`<slot name="title"></slot>`}
            </div>
            <div class="plan-visits">
                ${this.visits
                ? `${this.visits} monthly visits`
                : html`<slot name="visits"></slot>`}
            </div>
            <div class="plan-price">
                ${this.price ? `\$${this.price} /mo` : html`<slot name="price"></slot>`}
            </div>
            <button @click=${this._onClick}>
                <slot name="btn-text">Seleccionar opción</slot>
            </button>
            <ul class="features">
                ${featuresArr.length
                ? featuresArr.map(f => html`<li>${f}</li>`)
                : html`<slot name="features"></slot>`}
            </ul>
            </div>
        `;
    }
}

customElements.define('suscripcion-lit', SuscripcionLit);