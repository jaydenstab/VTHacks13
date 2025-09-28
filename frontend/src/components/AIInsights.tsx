import React, { useState, useEffect } from 'react';

interface AIInsightsProps {
  events: any[];
  userProfile?: any;
  onInsightClick?: (insight: any) => void;
}

interface Insight {
  id: string;
  type: 'trend' | 'recommendation' | 'prediction' | 'pattern' | 'alert';
  title: string;
  description: string;
  confidence: number;
  data: any;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
}

const AIInsights: React.FC<AIInsightsProps> = ({ events, userProfile, onInsightClick }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    generateInsights();
  }, [events, userProfile]);

  const generateInsights = async () => {
    setLoading(true);
    
    try {
      // Simulate AI insight generation
      const generatedInsights = await simulateAIInsights(events, userProfile);
      setInsights(generatedInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateAIInsights = async (events: any[], profile: any): Promise<Insight[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const insights: Insight[] = [
      {
        id: 'trend_1',
        type: 'trend',
        title: 'Music Events Trending',
        description: 'Jazz and electronic music events are 40% more popular this week',
        confidence: 87,
        data: { category: 'Music', growth: 40, subcategories: ['Jazz', 'Electronic'] },
        actionable: true,
        priority: 'high',
        timestamp: Date.now()
      },
      {
        id: 'recommendation_1',
        type: 'recommendation',
        title: 'Perfect Match Found',
        description: 'Based on your preferences, you\'d love the Art Gallery Opening in SoHo',
        confidence: 92,
        data: { eventId: 'event_123', reason: 'Matches your art and SoHo preferences' },
        actionable: true,
        priority: 'medium',
        timestamp: Date.now()
      },
      {
        id: 'prediction_1',
        type: 'prediction',
        title: 'Weather Impact Alert',
        description: 'Rain expected tomorrow may affect 3 outdoor events in your area',
        confidence: 78,
        data: { affectedEvents: 3, weather: 'Rain', impact: 'High' },
        actionable: true,
        priority: 'high',
        timestamp: Date.now()
      },
      {
        id: 'pattern_1',
        type: 'pattern',
        title: 'Your Event Pattern',
        description: 'You typically attend events on Friday evenings in Manhattan',
        confidence: 85,
        data: { day: 'Friday', time: 'Evening', location: 'Manhattan' },
        actionable: false,
        priority: 'low',
        timestamp: Date.now()
      },
      {
        id: 'alert_1',
        type: 'alert',
        title: 'Price Drop Alert',
        description: 'Comedy Show tickets dropped from $25 to $15 - 40% savings!',
        confidence: 100,
        data: { eventId: 'event_456', oldPrice: '$25', newPrice: '$15', savings: 40 },
        actionable: true,
        priority: 'high',
        timestamp: Date.now()
      }
    ];

    return insights;
  };

  const getInsightIcon = (type: string) => {
    const icons = {
      trend: '📈',
      recommendation: '💡',
      prediction: '🔮',
      pattern: '🔍',
      alert: '⚠️'
    };
    return icons[type as keyof typeof icons] || '📊';
  };

  const getInsightColor = (type: string, priority: string) => {
    if (priority === 'high') return '#FF3B30';
    if (priority === 'medium') return '#FF9500';
    if (priority === 'low') return '#34C759';
    
    const colors = {
      trend: '#007AFF',
      recommendation: '#AF52DE',
      prediction: '#FF9500',
      pattern: '#34C759',
      alert: '#FF3B30'
    };
    return colors[type as keyof typeof colors] || '#8E8E93';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#34C759';
    if (confidence >= 60) return '#FF9500';
    return '#FF3B30';
  };

  const filteredInsights = insights.filter(insight => 
    selectedCategory === 'all' || insight.type === selectedCategory
  );

  const categories = [
    { key: 'all', label: 'All Insights', count: insights.length },
    { key: 'trend', label: 'Trends', count: insights.filter(i => i.type === 'trend').length },
    { key: 'recommendation', label: 'Recommendations', count: insights.filter(i => i.type === 'recommendation').length },
    { key: 'prediction', label: 'Predictions', count: insights.filter(i => i.type === 'prediction').length },
    { key: 'pattern', label: 'Patterns', count: insights.filter(i => i.type === 'pattern').length },
    { key: 'alert', label: 'Alerts', count: insights.filter(i => i.type === 'alert').length }
  ];

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '24px',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1d1d1f',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px'
          }}>
            AI Insights
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#86868b',
            margin: '0'
          }}>
            Powered by advanced machine learning
          </p>
        </div>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            background: showAdvanced ? '#007AFF' : 'rgba(0, 0, 0, 0.05)',
            color: showAdvanced ? '#ffffff' : '#1d1d1f',
            border: 'none',
            borderRadius: '12px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
        </button>
      </div>

      {/* Category Filter */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {categories.map(category => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            style={{
              background: selectedCategory === category.key ? '#007AFF' : 'rgba(0, 0, 0, 0.05)',
              color: selectedCategory === category.key ? '#ffffff' : '#1d1d1f',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{category.label}</span>
            <span style={{
              background: selectedCategory === category.key ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {category.count}
            </span>
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          color: '#86868b'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid #e5e5e7',
            borderTop: '2px solid #007AFF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: '12px'
          }} />
          <span>Analyzing events with AI...</span>
        </div>
      )}

      {/* Insights List */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredInsights.map(insight => (
            <div
              key={insight.id}
              onClick={() => onInsightClick?.(insight)}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '16px',
                padding: '20px',
                cursor: insight.actionable ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (insight.actionable) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (insight.actionable) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* Priority Indicator */}
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '4px',
                background: getInsightColor(insight.type, insight.priority)
              }} />
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                {/* Icon */}
                <div style={{
                  fontSize: '24px',
                  lineHeight: '1'
                }}>
                  {getInsightIcon(insight.type)}
                </div>
                
                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1d1d1f',
                      margin: '0',
                      letterSpacing: '-0.3px'
                    }}>
                      {insight.title}
                    </h3>
                    
                    {/* Confidence Badge */}
                    <div style={{
                      background: getConfidenceColor(insight.confidence),
                      color: '#ffffff',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {insight.confidence}% confidence
                    </div>
                    
                    {/* Priority Badge */}
                    <div style={{
                      background: getInsightColor(insight.type, insight.priority),
                      color: '#ffffff',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {insight.priority}
                    </div>
                  </div>
                  
                  <p style={{
                    fontSize: '16px',
                    color: '#86868b',
                    margin: '0 0 12px 0',
                    lineHeight: '1.4'
                  }}>
                    {insight.description}
                  </p>
                  
                  {/* Action Button */}
                  {insight.actionable && (
                    <button style={{
                      background: '#007AFF',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}>
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredInsights.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#86868b'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#1d1d1f' }}>No insights available</h3>
              <p style={{ margin: '0' }}>AI is analyzing your events to generate insights</p>
            </div>
          )}
        </div>
      )}

      {/* Advanced Features */}
      {showAdvanced && (
        <div style={{
          marginTop: '24px',
          padding: '20px',
          background: 'rgba(0, 122, 255, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(0, 122, 255, 0.1)'
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '0 0 16px 0'
          }}>
            Advanced AI Features
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}>
              <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>Pattern Recognition</h5>
              <p style={{ margin: '0', fontSize: '12px', color: '#86868b' }}>
                Identifies your event preferences and patterns
              </p>
            </div>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}>
              <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>Predictive Analytics</h5>
              <p style={{ margin: '0', fontSize: '12px', color: '#86868b' }}>
                Predicts event popularity and weather impact
              </p>
            </div>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}>
              <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>Smart Recommendations</h5>
              <p style={{ margin: '0', fontSize: '12px', color: '#86868b' }}>
                ML-powered personalized event suggestions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AIInsights;
