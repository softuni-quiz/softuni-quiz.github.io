import html from '../../dom.js';

export const loader = () => html`
<div className="spinner-overlay">
    <div className="spinner-container">
        <div className="lds-spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>
</div>`;

export const localOverlay = () => html`
<div className="spinner-overlay local">
    <div className="spinner-container local">
        <div className="lds-spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>
</div>`;


export function overlayElement(element) {
    const overlay = localOverlay();
    element.appendChild(overlay);
    return overlay;
}