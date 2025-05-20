import React from "react";

const Recommendation = ({ text }) => (
  <div className="recommendations">
    <h2>Рекомендации</h2>
    <div className="recommendation-item">
      <p>{text}</p>
    </div>
  </div>
);

export default Recommendation;
