import { UI } from '../../utils/Constants.js';

export const styles = `
    .seismo-toast {
        position: relative;
        padding: 16px;
        border-radius: 12px;
        max-width: ${UI.TOAST_MAX_WIDTH}px;
        word-wrap: break-word;
        margin-bottom: 10px;
        pointer-events: auto;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        font-size: 14px;
        animation: seismo-slide-in 0.3s ease-out forwards;
        overflow: hidden;
        transition: all 0.3s ease;
    }

    .seismo-toast[data-mode="simple"] {
        padding: 12px 16px;
    }

    .seismo-toast:hover .seismo-progress-bar::after {
        animation-play-state: paused;
    }

    .seismo-toast[data-mode="simple"] .seismo-details {
        display: none;
    }

    .seismo-toast[data-mode="developer"] {
        padding: 16px;
    }

    .seismo-toast-error {
        background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
        border-left: 4px solid #7F1D1D;
    }

    .seismo-toast-warning {
        background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
        border-left: 4px solid #92400E;
    }

    .seismo-toast-server {
        background: linear-gradient(135deg, #5B21B6 0%, #4C1D95 100%);
        border-left: 4px solid #3B0764;
    }

    .seismo-progress-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background-color: rgba(255, 255, 255, 0.2);
    }

    .seismo-progress-bar::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background-color: rgba(255, 255, 255, 0.5);
        transform-origin: left;
        transform: scaleX(var(--progress, 1));
        transition: transform 0.1s linear;
    }

    .seismo-toast-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        color: white;
    }

    .seismo-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        stroke: currentColor;
    }

    .seismo-title {
        font-weight: 600;
        flex-grow: 1;
        color: white;
    }

    .seismo-actions {
        display: flex;
        gap: 4px;
    }

    .seismo-btn {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 6px;
        padding: 6px 8px;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        transition: all 0.2s;
        line-height: 1;
    }

    .seismo-btn:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .seismo-btn .seismo-icon {
        width: 16px;
        height: 16px;
    }

    .seismo-details {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        transition: max-height 0.3s ease, opacity 0.2s ease;
        max-height: 0;
        opacity: 0;
        overflow: hidden;
    }

    .seismo-toast[data-mode="developer"] .seismo-details {
        max-height: 500px;
        opacity: 1;
    }

    .seismo-detail-item {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 13px;
    }

    .seismo-detail-label {
        color: rgba(255, 255, 255, 0.7);
        font-weight: 500;
        min-width: 70px;
    }

    .seismo-expandable {
        cursor: pointer;
        padding: 8px;
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.1);
        margin-top: 4px;
        transition: all 0.3s ease;
    }

    .seismo-expandable:hover {
        background: rgba(0, 0, 0, 0.15);
    }

    .seismo-expandable.expanded {
        background: rgba(0, 0, 0, 0.2);
    }

    .seismo-response {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
        font-size: 12px;
        white-space: pre-wrap;
        word-break: break-word;
        max-height: ${UI.MAX_RESPONSE_HEIGHT}px;
        overflow-y: auto;
        padding-right: 8px;
        &::-webkit-scrollbar {
            width: 8px;
        }
        &::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
        }
        &::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
        }
        &::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
        }
    }

    @keyframes seismo-slide-in {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes seismo-slide-out {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .seismo-toast.removing {
        animation: seismo-slide-out 0.3s ease-in forwards;
    }

    .seismo-expand-btn {
        transition: transform 0.3s ease;
    }

    .seismo-toast[data-mode="developer"] .seismo-expand-btn {
        transform: rotate(180deg);
    }
`;