'use client'

import { useState } from 'react'
import styles from './edge-deployment.module.css'

export default function EdgeDeploymentPage() {
  const [activeTab, setActiveTab] = useState('clusters')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showDeployModal, setShowDeployModal] = useState(false)
  const [deployStep, setDeployStep] = useState(1)
  const [selectedModel, setSelectedModel] = useState(null)
  const [selectedCluster, setSelectedCluster] = useState(null)
  const [deploymentName, setDeploymentName] = useState('My LLM Deployment')

  const clusters = [
    {
      id: 'prod-east-cluster',
      name: 'prod-east-cluster',
      status: 'healthy',
      resourceGroup: 'rg-prod-east',
      region: 'East US',
      cpu: '45%',
      memory: '62%',
      gpu: '78%',
      availableGpus: '4 x NVIDIA A100',
      k8sVersion: '1.28.4',
      kaitoVersion: '0.4.1'
    },
    {
      id: 'dev-west-cluster',
      name: 'dev-west-cluster',
      status: 'warning',
      resourceGroup: 'Development',
      region: 'West US',
      cpu: '23%',
      memory: '41%',
      gpu: '12%',
      availableGpus: '2 x NVIDIA T4',
      k8sVersion: '1.27.8',
      kaitoVersion: '0.4.0'
    },
    {
      id: 'staging-cluster',
      name: 'staging-cluster',
      status: 'error',
      resourceGroup: 'rg-staging',
      region: 'Central US',
      cpu: '67%',
      memory: '95%',
      gpu: 'Error',
      availableGpus: '0/2 (Driver Error)',
      k8sVersion: '1.26.12',
      kaitoVersion: '0.4.0'
    }
  ]

  const deployedModels = [
    {
      id: 'phi-3-mini',
      name: 'phi-3-mini-4k-instruct',
      status: 'Running',
      cluster: 'prod-east-cluster',
      inferenceTime: '42ms',
      requestsPerMin: 127,
      memoryUsage: '4.2 GB',
      deployed: '2 days ago'
    },
    {
      id: 'mistral-7b',
      name: 'mistral/Mistral-7B-Instruct-v0.3',
      status: 'Running',
      cluster: 'prod-east-cluster',
      inferenceTime: '138ms',
      requestsPerMin: 52,
      memoryUsage: '13.8 GB',
      deployed: '1 week ago'
    },
    {
      id: 'phi-2',
      name: 'microsoft/phi-2',
      status: 'Scaling',
      cluster: 'dev-west-cluster',
      inferenceTime: '87ms',
      requestsPerMin: 12,
      memoryUsage: '2.7 GB',
      deployed: '3 hours ago'
    }
  ]

  const availableModels = [
    {
      id: 'phi-silica',
      name: 'microsoft/phi-silica',
      description: 'Small, efficient language model optimized for edge deployment',
      size: '1.3 GB',
      selected: false
    },
    {
      id: 'phi-3-medium',
      name: 'microsoft/phi-3-medium',
      description: 'Medium-sized model with excellent instruction following',
      size: '14.2 GB',
      selected: false
    },
    {
      id: 'llama-2-7b',
      name: 'meta-llama/llama-2-7b',
      description: 'Foundation model with strong general language capabilities',
      size: '13.5 GB',
      selected: false
    }
  ]

  const authenticate = () => {
    setIsAuthenticated(true)
  }

  const openDeployModal = () => {
    setShowDeployModal(true)
    setDeployStep(1)
  }

  const closeDeployModal = () => {
    setShowDeployModal(false)
    setDeployStep(1)
    setSelectedModel(null)
    setSelectedCluster(null)
  }

  const selectModel = (modelId) => {
    setSelectedModel(modelId)
  }

  const selectCluster = (clusterId) => {
    setSelectedCluster(clusterId)
  }

  const goToStep2 = () => {
    if (selectedModel) {
      setDeployStep(2)
    }
  }

  const goToStep1 = () => {
    setDeployStep(1)
  }

  const deployModel = () => {
    if (selectedModel && selectedCluster) {
      // Redirect to deployment progress
      window.location.href = `/deployment-progress?model=${encodeURIComponent(selectedModel)}&cluster=${encodeURIComponent(selectedCluster)}`
    }
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'healthy': return 'green'
      case 'warning': return 'yellow'
      case 'error': return 'red'
      default: return 'gray'
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h3>AI TOOLKIT</h3>
        </div>
        
        <div className={styles.sectionHeader}>
          <span>MODELS</span>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.modelItem}>Model Catalog</div>
          <div className={styles.modelItem}>Playground</div>
          <div className={styles.modelItem}>Fine-tuning</div>
        </div>

        <div className={styles.sectionHeader}>
          <span>TOOLS</span>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.modelItem}>Playground</div>
          <div className={styles.modelItem}>Agent (Prompt) Builder</div>
          <div className={styles.modelItem}>Bulk Run</div>
          <div className={styles.modelItem}>Evaluation</div>
        </div>
      </div>

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
          <button className={styles.deployButton} onClick={openDeployModal}>
            Deploy to Edge
          </button>
        </div>

        {!isAuthenticated ? (
          <div className={styles.authContainer}>
            <div className={styles.authIcon}>🔑</div>
            <div className={styles.authTitle}>Authentication Required</div>
            <div className={styles.authDescription}>
              Please authenticate to access your Arc-enabled Kubernetes clusters.
              This will allow you to view and deploy LLM models to your edge clusters.
            </div>
            <button className={styles.authButton} onClick={authenticate}>
              Authenticate
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'clusters' && (
              <div className={styles.mainContent}>
                <h2>Arc-enabled Kubernetes Clusters</h2>
                <p>The following clusters are available for edge deployment of your AI models:</p>
                
                {clusters.map(cluster => (
                  <div key={cluster.id} className={styles.clusterCard}>
                    <div className={styles.clusterHeader}>
                      <div className={styles.clusterName}>
                        <span className={`${styles.statusDot} ${styles[getStatusColor(cluster.status)]}`}></span>
                        {cluster.name}
                      </div>
                      <div className={styles.clusterStatus}>{cluster.status}</div>
                    </div>
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
                        <div className={styles.metricValue}>{cluster.availableGpus}</div>
                      </div>
                      <div className={styles.metricRow}>
                        <div className={styles.metricLabel}>Kubernetes Version:</div>
                        <div className={styles.metricValue}>{cluster.k8sVersion}</div>
                      </div>
                      <div className={styles.metricRow}>
                        <div className={styles.metricLabel}>Kaito Version:</div>
                        <div className={styles.metricValue}>{cluster.kaitoVersion}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'models' && (
              <div className={styles.mainContent}>
                <h2>Deployed Models</h2>
                <p>The following models are currently deployed to your edge clusters:</p>

                {deployedModels.map(model => (
                  <div key={model.id} className={styles.deployedModelCard}>
                    <div className={styles.deployedModelHeader}>
                      <div className={styles.deployedModelName}>{model.name}</div>
                      <div><span className={styles.badge}>{model.status}</span></div>
                    </div>
                    <div className={styles.deployedModelCluster}>
                      Deployed on: {model.cluster}
                    </div>
                    <div className={styles.deployedModelMetrics}>
                      <div>Inference time (avg): {model.inferenceTime}</div>
                      <div>Requests per minute: {model.requestsPerMin}</div>
                      <div>Memory usage: {model.memoryUsage}</div>
                      <div>Deployed: {model.deployed}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Deploy to Edge Modal */}
        {showDeployModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <div className={styles.stepsIndicator}>
                  <div className={`${styles.step} ${deployStep === 1 ? styles.active : ''}`}>
                    Step 1: Select Model
                  </div>
                  <div className={`${styles.step} ${deployStep === 2 ? styles.active : ''}`}>
                    Step 2: Select Cluster
                  </div>
                </div>
                <button className={styles.closeButton} onClick={closeDeployModal}>×</button>
              </div>

              {deployStep === 1 && (
                <div className={styles.modalBody}>
                  <div className={styles.stepContainer}>
                    <div className={styles.stepHeader}>STEP 1</div>
                    <div className={styles.stepTitle}>Select the model to deploy</div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>LLM Name / Deployment Name</label>
                    <input 
                      type="text" 
                      className={styles.formInput}
                      value={deploymentName}
                      onChange={(e) => setDeploymentName(e.target.value)}
                    />
                  </div>

                  <div className={styles.modelsList}>
                    {availableModels.map(model => (
                      <div 
                        key={model.id}
                        className={`${styles.modelOption} ${selectedModel === model.id ? styles.selected : ''}`}
                        onClick={() => selectModel(model.id)}
                      >
                        <div>
                          <input 
                            type="radio" 
                            name="model" 
                            checked={selectedModel === model.id}
                            onChange={() => selectModel(model.id)}
                          />
                        </div>
                        <div className={styles.modelDetails}>
                          <div className={styles.selectedModelName}>{model.name}</div>
                          <div className={styles.modelDescription}>{model.description}</div>
                          <div className={styles.modelSize}>Model size: {model.size}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.wizardButtons}>
                    <button className={styles.buttonSecondary} onClick={closeDeployModal}>
                      Cancel
                    </button>
                    <button 
                      className={styles.buttonPrimary} 
                      onClick={goToStep2}
                      disabled={!selectedModel}
                    >
                      Next Step →
                    </button>
                  </div>
                </div>
              )}

              {deployStep === 2 && (
                <div className={styles.modalBody}>
                  <div className={styles.stepContainer}>
                    <div className={styles.stepHeader}>STEP 2</div>
                    <div className={styles.stepTitle}>Select deployment target</div>
                  </div>

                  <div className={styles.deploymentSummary}>
                    <h4>Deployment Summary</h4>
                    <div className={styles.summaryItem}>
                      <div className={styles.summaryLabel}>Model Name:</div>
                      <div className={styles.summaryValue}>
                        {selectedModel ? availableModels.find(m => m.id === selectedModel)?.name : ''}
                      </div>
                    </div>
                    <div className={styles.summaryItem}>
                      <div className={styles.summaryLabel}>Deployment Name:</div>
                      <div className={styles.summaryValue}>{deploymentName}</div>
                    </div>
                    <div className={styles.summaryItem}>
                      <div className={styles.summaryLabel}>Model Size:</div>
                      <div className={styles.summaryValue}>
                        {selectedModel ? availableModels.find(m => m.id === selectedModel)?.size : ''}
                      </div>
                    </div>
                  </div>

                  <div className={styles.clusterFilters}>
                    <select className={styles.filterSelect}>
                      <option value="all">All Resource Groups</option>
                      <option value="rg-prod-east">rg-prod-east</option>
                      <option value="Development">Development</option>
                      <option value="rg-staging">rg-staging</option>
                    </select>
                    <select className={styles.filterSelect}>
                      <option value="all">All Regions</option>
                      <option value="East US">East US</option>
                      <option value="West US">West US</option>
                      <option value="Central US">Central US</option>
                    </select>
                    <select className={styles.filterSelect}>
                      <option value="all">All Hardware</option>
                      <option value="GPU">GPU</option>
                      <option value="CPU">CPU</option>
                    </select>
                  </div>

                  <div className={styles.clusterOptions}>
                    {clusters.map(cluster => (
                      <div 
                        key={cluster.id}
                        className={`${styles.clusterOption} ${selectedCluster === cluster.id ? styles.selected : ''}`}
                        onClick={() => selectCluster(cluster.id)}
                      >
                        <div className={styles.clusterOptionHeader}>
                          <div>
                            <span className={`${styles.statusDot} ${styles[getStatusColor(cluster.status)]}`}></span>
                            {cluster.name}
                          </div>
                          <div>
                            <input 
                              type="radio" 
                              name="cluster" 
                              checked={selectedCluster === cluster.id}
                              onChange={() => selectCluster(cluster.id)}
                            />
                          </div>
                        </div>
                        <div className={styles.clusterOptionDetails}>
                          <div className={styles.clusterDetailRow}>
                            <div className={styles.clusterDetailLabel}>Resource Group:</div>
                            <div className={styles.clusterDetailValue}>{cluster.resourceGroup}</div>
                          </div>
                          <div className={styles.clusterDetailRow}>
                            <div className={styles.clusterDetailLabel}>Region:</div>
                            <div className={styles.clusterDetailValue}>{cluster.region}</div>
                          </div>
                          <div className={styles.clusterDetailRow}>
                            <div className={styles.clusterDetailLabel}>Available GPUs:</div>
                            <div className={styles.clusterDetailValue}>{cluster.availableGpus}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.wizardButtons}>
                    <button className={styles.buttonSecondary} onClick={goToStep1}>
                      ← Back
                    </button>
                    <button 
                      className={styles.buttonPrimary} 
                      onClick={deployModel}
                      disabled={!selectedCluster}
                    >
                      Deploy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
