import React from 'react';

const SimpleChart = ({ type, data, title }) => {
  if (type === 'bar') {
    return (
      <div className="simple-chart">
        <h3>{title}</h3>
        <div className="bar-chart">
          {data.map((item, index) => (
            <div key={index} className="bar-item">
              <div className="bar-label">{item.label}</div>
              <div className="bar">
                <div 
                  className="bar-fill" 
                  style={{ width: `${item.value}%` }}
                ></div>
              </div>
              <div className="bar-value">{item.value.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div className="simple-chart">
        <h3>{title}</h3>
        <div className="line-chart">
          {data.map((item, index) => (
            <div key={index} className="trend-item">
              <div className="trend-month">{item.label}</div>
              <div className="trend-score">{item.value}%</div>
              <div className={`trend-indicator ${item.improvement ? 'up' : 'down'}`}>
                {item.improvement ? '📈' : '📉'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default SimpleChart;
