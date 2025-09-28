import React from 'react';
import { EventCategory } from '../types/Event';

interface CategoryFilterProps {
  selectedCategory: EventCategory;
  onCategoryChange: (category: EventCategory) => void;
  eventCounts: { [key in EventCategory]: number };
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  selectedCategory, 
  onCategoryChange, 
  eventCounts 
}) => {
  const categories: { key: EventCategory; label: string; emoji: string }[] = [
    { key: 'All', label: 'All Events', emoji: '🌟' },
    { key: 'Music', label: 'Music', emoji: '🎵' },
    { key: 'Art', label: 'Art', emoji: '🎨' },
    { key: 'Food & Drink', label: 'Food & Drink', emoji: '🍽️' },
    { key: 'Comedy', label: 'Comedy', emoji: '😂' },
    { key: 'Free', label: 'Free', emoji: '🆓' },
    { key: 'Other', label: 'Other', emoji: '📍' }
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {categories.map((category) => (
        <button
          key={category.key}
          onClick={() => onCategoryChange(category.key)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: selectedCategory === category.key ? '#007AFF' : 'rgba(0, 0, 0, 0.05)',
            color: selectedCategory === category.key ? '#ffffff' : '#1d1d1f',
            fontSize: '15px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            boxShadow: selectedCategory === category.key 
              ? '0 4px 16px rgba(0, 122, 255, 0.3)' 
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
            minWidth: '100px',
            justifyContent: 'center',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
            letterSpacing: '-0.2px'
          }}
          onMouseEnter={(e) => {
            if (selectedCategory !== category.key) {
              e.currentTarget.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedCategory !== category.key) {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }
          }}
        >
          <span style={{ fontSize: '16px', lineHeight: '1' }}>{category.emoji}</span>
          <span style={{ lineHeight: '1' }}>{category.label}</span>
          <span style={{
            backgroundColor: selectedCategory === category.key ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
            color: selectedCategory === category.key ? '#ffffff' : '#1d1d1f',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '600',
            minWidth: '20px',
            textAlign: 'center',
            lineHeight: '1'
          }}>
            {eventCounts[category.key]}
          </span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
