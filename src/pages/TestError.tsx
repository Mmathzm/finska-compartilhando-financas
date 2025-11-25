import React from 'react';

export default function TestError() {
  // Intentionally throw an error to validate ErrorBoundary
  throw new Error('Teste intencional de erro - ErrorBoundary');
}
