import React from 'react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Xác nhận", cancelText = "Hủy" }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '400px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                animation: 'fade-in 0.2s ease-out'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '18px', color: '#111827' }}>
                    {title || 'Xác nhận'}
                </h3>
                <p style={{ margin: 0, marginBottom: '24px', fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
                    {message}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button 
                        onClick={onCancel}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'transparent',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#374151',
                            fontWeight: 500
                        }}
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={onConfirm}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#ef4444',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: 'white',
                            fontWeight: 500
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
