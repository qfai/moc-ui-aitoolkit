import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#e0e0e0', marginBottom: '30px' }}>Kaito UI Components</h1>
      
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>        <Link href="/deployment-wizard" style={{ textDecoration: 'none' }}>
          <div style={{ 
            background: '#2d2d2d', 
            padding: '20px', 
            borderRadius: '8px', 
            border: '1px solid #555',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            <h3 style={{ color: '#e0e0e0', marginBottom: '10px' }}>Model Deployment Wizard</h3>
            <p style={{ color: '#b0b0b0', fontSize: '14px' }}>
              Comprehensive 3-step wizard for model selection, cluster configuration, and deployment to Kubernetes
            </p>
          </div>
        </Link>

        <Link href="/deployment-progress" style={{ textDecoration: 'none' }}>
          <div style={{ 
            background: '#2d2d2d', 
            padding: '20px', 
            borderRadius: '8px', 
            border: '1px solid #555',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            <h3 style={{ color: '#e0e0e0', marginBottom: '10px' }}>Deployment Progress</h3>
            <p style={{ color: '#b0b0b0', fontSize: '14px' }}>
              Real-time monitoring of model deployment progress with detailed logs
            </p>
          </div>
        </Link>

        <Link href="/finetune-wizard" style={{ textDecoration: 'none' }}>
          <div style={{ 
            background: '#2d2d2d', 
            padding: '20px', 
            borderRadius: '8px', 
            border: '1px solid #555',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            <h3 style={{ color: '#e0e0e0', marginBottom: '10px' }}>Fine-tune Wizard</h3>
            <p style={{ color: '#b0b0b0', fontSize: '14px' }}>
              Comprehensive wizard for fine-tuning foundation models with custom datasets
            </p>
          </div>
        </Link>        <Link href="/edge-deployment" style={{ textDecoration: 'none' }}>
          <div style={{ 
            background: '#2d2d2d', 
            padding: '20px', 
            borderRadius: '8px', 
            border: '1px solid #555',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            <h3 style={{ color: '#e0e0e0', marginBottom: '10px' }}>Edge Deployment</h3>
            <p style={{ color: '#b0b0b0', fontSize: '14px' }}>
              Main interface for managing edge clusters and deploying models with authentication
            </p>
          </div>
        </Link>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: '#2d2d2d', borderRadius: '8px' }}>
        <h2 style={{ color: '#e0e0e0', marginBottom: '15px' }}>Getting Started</h2>
        <p style={{ color: '#b0b0b0', lineHeight: '1.6' }}>
          This Next.js application contains converted versions of the original HTML mockups. 
          Each page preserves the original UI/UX design while being built as modern React components 
          with proper state management and interactivity.
        </p>
        <ul style={{ color: '#b0b0b0', marginTop: '15px', paddingLeft: '20px' }}>
          <li>All components use CSS modules for scoped styling</li>
          <li>State management handled with React hooks</li>
          <li>TypeScript support for better development experience</li>
          <li>Responsive design for various screen sizes</li>
          <li>VS Code-like theme matching the original designs</li>
        </ul>
      </div>
    </div>
  )
}
