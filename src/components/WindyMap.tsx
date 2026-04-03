import React from 'react';

const WindyMap = () => {
  // Using the parameters you provided.
  const lat = 31.1471;
  const lon = 75.3412;
  const model = "GFS"; // gfs
  const key = 'windyisthebest'; // This is a sample key.

  // Constructing the URL for the Windy.com embed.
  const windyURL = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=8&overlay=wind&level=surface&product=${model}&key=${key}`;

  return (
    <iframe
      style={{ width: '100%', height: '100%', border: 'none' }}
      src={windyURL}
      title=""
    ></iframe>
  );
};

export default WindyMap;
