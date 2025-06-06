'use client'

import { useState } from 'react'
import styles from './vscode-integration.module.css'

interface IntegrationStep {
  id: string
  title: string
  description: string
  status: 'completed' | 'active' | 'pending'
  details?: string[]
}

export default function VSCodeIntegrationPage() {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null)

  const integrationSteps: IntegrationStep[] = [
    {
      id: 'install',
      title: 'Install Kaito Extension',
      description: 'Install the Kaito extension in VS Code',
      status: 'completed',
      details: [
        'Extension installed successfully',
        'Version: 1.0.0',
        'Publisher: Microsoft'
      ]
    },
    {
      id: 'authenticate',
      title: 'Authenticate with Azure',
      description: 'Connect to your Azure subscription',
      status: 'active',
      details: [
        'Azure CLI available',
        'Authentication required',
        'Permissions: Contributor'
      ]
    },
    {
      id: 'workspace',
      title: 'Select Workspace',
      description: 'Choose your AI/ML workspace',
      status: 'pending'
    },
    {
      id: 'clusters',
      title: 'Discover Clusters',
      description: 'Find available Kubernetes clusters',
      status: 'pending'
    },
    {
      id: 'deploy',
      title: 'Deploy Models',
      description: 'Start deploying AI models',
      status: 'pending'
    }
  ]

  const workspaces = [
    {
      id: 'ws1',
      name: 'ai-development',
      resourceGroup: 'rg-ai-dev',
      region: 'East US',
      models: 12,
      status: 'active'
    },
    {
      id: 'ws2', 
      name: 'production-ml',
      resourceGroup: 'rg-prod',
      region: 'West US 2',
      models: 8,
      status: 'active'
    },
    {
      id: 'ws3',
      name: 'experimental',
      resourceGroup: 'rg-exp',
      region: 'Central US',
      models: 3,
      status: 'inactive'
    }
  ]

  const handleConnect = async () => {
    setConnectionStatus('connecting')
    // Simulate connection process
    setTimeout(() => {
      setConnectionStatus('connected')
    }, 2000)
  }

  const handleSelectWorkspace = (workspaceId: string) => {
    setSelectedWorkspace(workspaceId)
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅'
      case 'active': return '🔄'
      case 'pending': return '⏳'
      default: return '○'
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>Kaito VS Code Integration</div>
        <div className={styles.subtitle}>Connect your VS Code workspace to Azure Kubernetes Service</div>
      </div>

      <div className={styles.content}>
        <div className={styles.leftPanel}>
          <div className={styles.section}>
            <h3>Integration Steps</h3>
            <div className={styles.steps}>
              {integrationSteps.map((step) => (
                <div key={step.id} className={`${styles.step} ${styles[step.status]}`}>
                  <div className={styles.stepIcon}>{getStepIcon(step.status)}</div>
                  <div className={styles.stepContent}>
                    <div className={styles.stepTitle}>{step.title}</div>
                    <div className={styles.stepDescription}>{step.description}</div>
                    {step.details && step.status === 'active' && (
                      <div className={styles.stepDetails}>
                        {step.details.map((detail, index) => (
                          <div key={index} className={styles.stepDetail}>• {detail}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h3>Connection Status</h3>
            <div className={styles.connectionCard}>
              <div className={styles.connectionStatus}>
                <div className={`${styles.statusIndicator} ${styles[connectionStatus]}`}></div>
                <div className={styles.statusText}>
                  {connectionStatus === 'connected' ? 'Connected to Azure' : 
                   connectionStatus === 'connecting' ? 'Connecting...' : 'Not Connected'}
                </div>
              </div>
              {connectionStatus === 'disconnected' && (
                <button className={styles.button} onClick={handleConnect}>
                  Connect to Azure
                </button>
              )}
              {connectionStatus === 'connecting' && (
                <div className={styles.spinner}></div>
              )}
              {connectionStatus === 'connected' && (
                <div className={styles.connectedInfo}>
                  <div>✅ Subscription: Visual Studio Enterprise</div>
                  <div>✅ Resource Groups: 15 found</div>
                  <div>✅ Clusters: 8 AKS clusters available</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.section}>
            <h3>Available Workspaces</h3>
            <div className={styles.workspaces}>
              {workspaces.map((workspace) => (
                <div 
                  key={workspace.id}
                  className={`${styles.workspaceCard} ${selectedWorkspace === workspace.id ? styles.selected : ''}`}
                  onClick={() => handleSelectWorkspace(workspace.id)}
                >
                  <div className={styles.workspaceHeader}>
                    <div className={styles.workspaceName}>{workspace.name}</div>
                    <div className={`${styles.workspaceStatus} ${styles[workspace.status]}`}>
                      {workspace.status}
                    </div>
                  </div>
                  <div className={styles.workspaceDetails}>
                    <div className={styles.workspaceDetail}>
                      <span className={styles.label}>Resource Group:</span>
                      <span className={styles.value}>{workspace.resourceGroup}</span>
                    </div>
                    <div className={styles.workspaceDetail}>
                      <span className={styles.label}>Region:</span>
                      <span className={styles.value}>{workspace.region}</span>
                    </div>
                    <div className={styles.workspaceDetail}>
                      <span className={styles.label}>Models:</span>
                      <span className={styles.value}>{workspace.models} available</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h3>Quick Actions</h3>
            <div className={styles.quickActions}>
              <button className={styles.actionButton} disabled={!selectedWorkspace}>
                <div className={styles.actionIcon}>🚀</div>
                <div className={styles.actionText}>
                  <div className={styles.actionTitle}>Deploy Model</div>
                  <div className={styles.actionDescription}>Start model deployment wizard</div>
                </div>
              </button>
              <button className={styles.actionButton} disabled={!selectedWorkspace}>
                <div className={styles.actionIcon}>⚙️</div>
                <div className={styles.actionText}>
                  <div className={styles.actionTitle}>Manage Clusters</div>
                  <div className={styles.actionDescription}>View and configure clusters</div>
                </div>
              </button>
              <button className={styles.actionButton} disabled={!selectedWorkspace}>
                <div className={styles.actionIcon}>📊</div>
                <div className={styles.actionText}>
                  <div className={styles.actionTitle}>View Analytics</div>
                  <div className={styles.actionDescription}>Monitor deployment metrics</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
