import React, { useState } from 'react';

interface BasicDropdownProps {
  message: any;
  onReply?: (message: any) => void;
  onForward?: (message: any) => void;
  onCopy?: (message: any) => void;
  onReport?: (message: any) => void;
  onDelete?: (message: any) => void;
}

const BasicDropdown: React.FC<BasicDropdownProps> = ({
  message,
  onReply,
  onForward,
  onCopy,
  onReport,
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    console.log('🎯 Dropdown button clicked! Show menu:', !showMenu);
    setShowMenu(!showMenu);
  };

  const handleAction = (action: () => void) => {
    action();
    setShowMenu(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* 3-Dot Button - Clean inline styles */}
      <button 
        onClick={toggleMenu}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f9fafb';
          e.currentTarget.style.borderColor = '#d1d5db';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'white';
          e.currentTarget.style.borderColor = '#e5e7eb';
        }}
        type="button"
      >
        <svg 
          style={{ width: '16px', height: '16px', color: '#6b7280' }} 
          viewBox="0 0 4 15" 
          fill="currentColor"
        >
          <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
        </svg>
      </button>
      
      {/* Dropdown Menu - Clean inline styles */}
      {showMenu && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            marginTop: '4px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            minWidth: '160px',
            zIndex: 1000,
          }}
        >
          <div style={{ padding: '8px 0' }}>
            <button 
              onClick={() => handleAction(() => onReply?.(message))}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 16px',
                textAlign: 'left',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Reply
            </button>
            <button 
              onClick={() => handleAction(() => onForward?.(message))}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 16px',
                textAlign: 'left',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Forward
            </button>
            <button 
              onClick={() => handleAction(() => onCopy?.(message))}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 16px',
                textAlign: 'left',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Copy
            </button>
            <button 
              onClick={() => handleAction(() => onReport?.(message))}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 16px',
                textAlign: 'left',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Report
            </button>
            <button 
              onClick={() => handleAction(() => onDelete?.(message))}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 16px',
                textAlign: 'left',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#dc2626',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicDropdown;
