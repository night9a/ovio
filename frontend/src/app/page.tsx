'use client';

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('http://localhost:5000/api/hello')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((error) => setMessage('Error connecting to backend'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Welcome to Our App</h1>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}