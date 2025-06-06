'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import styles from './edge.module.css'

interface Cluster {
  id: string
  name: string
  status: 'healthy' | 'warning' | 'critical'
  cpu: string
  memory: string
  gpu: string
  gpuDetails: string
  kubernetesVersion: string
  kaitoVersion: string
}

interface DeployedModel {
  name: string
  status: 'running' | 'scaling' | 'error'
  cluster: string
  inferenceTime: string
  requestsPerMinute: number
  memoryUsage: string
  deployedDate: string
}

export default function EdgePage() {
  const [activeTab, setActiveTab] = useState('clusters')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null)

  const clusters: Cluster[] = [
    {
      id: 'cluster1',
      name: 'prod-east-cluster',
      status: 'healthy',
      cpu: '45%',
      memory: '62%',
      gpu: '78%',
      gpuDetails: '4 x NVIDIA A100',
      kubernetesVersion: '1.28.4',
      kaitoVersion: '0.4.3'
    },
    {
      id: 'cluster2',
      name: 'dev-west-cluster',
      status: 'warning',
      cpu: '78%',
      memory: '82%',
      gpu: '25%',
      gpuDetails: '2 x NVIDIA T4',
      kubernetesVersion: '1.27.7',
      kaitoVersion: '0.4.2'
    },
    {
      id: 'cluster3',
      name: 'test-central-cluster',
      status: 'critical',
      cpu: '92%',
      memory: '95%',
      gpu: 'Error',
      gpuDetails: '0/2 (Driver Error)',
      kubernetesVersion: '1.26.12',
      kaitoVersion: '0.4.0'
    }
  ]

  const deployedModels: DeployedModel[] = [
    {
      name: 'phi-3-mini-4k-instruct',
      status: 'running',
      cluster: 'prod-east-cluster',
      inferenceTime: '42ms',
      requestsPerMinute: 127,
      memoryUsage: '4.2 GB',
      deployedDate: '2 days ago'
    },
    {
      name: 'mistral/Mistral-7B-Instruct-v0.3',
      status: 'running',
      cluster: 'prod-east-cluster',
      inferenceTime: '138ms',
      requestsPerMinute: 52,
      memoryUsage: '13.8 GB',
      deployedDate: '1 week ago'
    },
    {
      name: 'microsoft/phi-2',
      status: 'scaling',
      cluster: 'dev-west-cluster',
      inferenceTime: '87ms',
      requestsPerMinute: 12,
      memoryUsage: '2.7 GB',
      deployedDate: '3 hours ago'
    }
  ]

  const authenticate = () => {
    setIsAuthenticated(true)
  }

  const toggleClusterDetails = (clusterId: string) => {
    setExpandedCluster(expandedCluster === clusterId ? null : clusterId)
  }

  const deployToEdge = () => {
    window.location.href = '/deployment-wizard'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#4EC9B0'
      case 'warning': return '#FFCC00'
      case 'critical': return '#F48771'
      default: return '#888888'
    }
  }

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'running': return styles.badgeRunning
      case 'scaling': return styles.badgeScaling
      case 'error': return styles.badgeError
      default: return styles.badge
    }
  }

  return (
    <div className={styles.container}>
      <Sidebar />
      
      <div className={styles.contentArea}>
        <div className={styles.topBar}>
          <div className={styles.tabs}>
            <div 
              className={`${styles.tab} ${activeTab === 'edge' ? styles.active : ''}`}
              onClick={() => setActiveTab('edge')}
            >
              Edge Deployments
            </div>
            <div 
              className={`${styles.tab} ${activeTab === 'clusters' ? styles.active : ''}`}
              onClick={() => setActiveTab('clusters')}
            >
              Clusters
            </div>
            <div 
              className={`${styles.tab} ${activeTab === 'models' ? styles.active : ''}`}
              onClick={() => setActiveTab('models')}
            >
              Deployed Models
            </div>
          </div>
          <button className={styles.button} onClick={deployToEdge}>
            Deploy to Edge
          </button>
        </div>

        {!isAuthenticated ? (
          <div className={styles.mainContent}>
            <div className={styles.authContainer}>
              <div className={styles.authIcon}>🔑</div>
              <div className={styles.authTitle}>Authentication Required</div>
              <div className={styles.authDescription}>
                Please authenticate to access your Arc-enabled Kubernetes clusters.
                This will allow you to view and deploy LLM models to your edge clusters.
              </div>
              <button className={styles.button} onClick={authenticate}>
                Authenticate
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'clusters' && (
              <div className={styles.mainContent}>
                <h2>Arc-enabled Kubernetes Clusters</h2>
                <p>The following clusters are available for edge deployment of your AI models:</p>
                
                {clusters.map((cluster) => (
                  <div key={cluster.id} className={styles.clusterCard}>
                    <div 
                      className={styles.clusterHeader}
                      onClick={() => toggleClusterDetails(cluster.id)}
                    >
                      <div className={styles.clusterName}>
                        <span 
                          className={styles.statusDot}
                          style={{ backgroundColor: getStatusColor(cluster.status) }}
                        ></span>
                        {cluster.name}
                      </div>
                      <div className={styles.clusterStatus}>
                        {cluster.status.charAt(0).toUpperCase() + cluster.status.slice(1)}
                      </div>
                    </div>
                    {expandedCluster === cluster.id && (
                      <div className={styles.clusterContent}>
                        <div className={styles.metricRow}>
                          <div className={styles.metricLabel}>CPU Usage:</div>
                          <div className={styles.metricValue}>{cluster.cpu}</div>
                        </div>
                        <div className={styles.metricRow}>
                          <div className={styles.metricLabel}>Memory Usage:</div>
                          <div className={styles.metricValue}>{cluster.memory}</div>
                        </div>
                        <div className={styles.metricRow}>
                          <div className={styles.metricLabel}>GPU Usage:</div>
                          <div className={styles.metricValue}>{cluster.gpu}</div>
                        </div>
                        <div className={styles.metricRow}>
                          <div className={styles.metricLabel}>Available GPUs:</div>
                          <div className={styles.metricValue}>{cluster.gpuDetails}</div>
                        </div>
                        <div className={styles.metricRow}>
                          <div className={styles.metricLabel}>Kubernetes Version:</div>
                          <div className={styles.metricValue}>{cluster.kubernetesVersion}</div>
                        </div>
                        <div className={styles.metricRow}>
                          <div className={styles.metricLabel}>Kaito Version:</div>
                          <div className={styles.metricValue}>{cluster.kaitoVersion}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'models' && (
              <div className={styles.mainContent}>
                <h2>Deployed Models</h2>
                <p>The following models are currently deployed to your edge clusters:</p>

                {deployedModels.map((model, index) => (
                  <div key={index} className={styles.deployedModelCard}>
                    <div className={styles.deployedModelHeader}>
                      <div className={styles.deployedModelName}>{model.name}</div>
                      <div>
                        <span className={getBadgeClass(model.status)}>
                          {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className={styles.deployedModelCluster}>
                      Deployed on: {model.cluster}
                    </div>
                    <div className={styles.deployedModelMetrics}>
                      <div>Inference time (avg): {model.inferenceTime}</div>
                      <div>Requests per minute: {model.requestsPerMinute}</div>
                      <div>Memory usage: {model.memoryUsage}</div>
                      <div>Deployed: {model.deployedDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'edge' && (
              <div className={styles.mainContent}>
                <h2>Edge Deployments</h2>
                <p>Manage and monitor your edge deployments across multiple clusters.</p>
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🚀</div>
                  <div className={styles.emptyTitle}>No Edge Deployments</div>
                  <div className={styles.emptyDescription}>
                    Get started by deploying your first AI model to an edge cluster.
                  </div>
                  <button className={styles.button} onClick={deployToEdge}>
                    Deploy First Model
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
