'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './deployment-wizard.module.css';

interface ModelData {
  [key: string]: {
    name: string;
    description: string;
    size: string;
    hardware: string;
  };
}

interface InstanceType {
  SKU: string;
  GPUCount: number;
  GPUMemGB: number;
  GPUModel: string;
}

interface DeploymentConfig {
  name: string;
  instanceType: string;
  replicas: number;
  memoryLimit: number;
  cpuLimit: number;
  gpuMemoryUtilization: number;
  swapSpace: number;
}

const DeploymentWizard: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedCluster, setSelectedCluster] = useState<string>('');
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig>({
    name: 'My LLM Deployment',
    instanceType: 'Standard_NK6',
    replicas: 1,
    memoryLimit: 16,
    cpuLimit: 4,
    gpuMemoryUtilization: 0.9,
    swapSpace: 4
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');

  const modelData: ModelData = {
    'microsoft/phi-silica': {
      name: 'Microsoft Phi Silica',
      description: 'Small, efficient language model optimized for edge deployment with strong reasoning capabilities.',
      size: '1.3 GB',
      hardware: 'GPU Required'
    },
    'microsoft/phi-3-mini': {
      name: 'Microsoft Phi-3 Mini',
      description: 'Lightweight 3.8B parameter model with strong performance on language tasks and coding.',
      size: '2.4 GB',
      hardware: 'GPU Required'
    },
    'microsoft/phi-3-medium': {
      name: 'Microsoft Phi-3 Medium',
      description: 'Balanced 14B parameter model offering improved capabilities while maintaining efficiency.',
      size: '8.4 GB',
      hardware: 'GPU Required'
    },
    'meta-llama/llama-2-7b': {
      name: 'Llama 2 7B',
      description: 'Meta\'s 7B parameter foundation model with strong general language capabilities.',
      size: '13.5 GB',
      hardware: 'GPU Required'
    },
    'mistralai/mistral-7b': {
      name: 'Mistral 7B',
      description: 'High-performance 7B model with excellent instruction following and code generation.',
      size: '14.2 GB',
      hardware: 'GPU Required'
    },
    'microsoft/dialoGPT-medium': {
      name: 'DialoGPT Medium',
      description: 'Conversational AI model trained on Reddit conversations for dialogue generation.',
      size: '1.7 GB',
      hardware: 'GPU Required'
    },
    'deepseek-r1-distill-qwen-14b': {
      name: 'DeepSeek R1 Distill Qwen 14B',
      description: 'Advanced reasoning model with strong performance across multiple domains and tasks.',
      size: '28 GB',
      hardware: 'GPU Required'
    }
  };

  const instanceTypes: { [key: string]: InstanceType } = {
    'Standard_NK6': { SKU: 'Standard_NK6', GPUCount: 1, GPUMemGB: 8, GPUModel: 'NVIDIA T4' },
    'Standard_NK12': { SKU: 'Standard_NK12', GPUCount: 2, GPUMemGB: 16, GPUModel: 'NVIDIA T4' },
    'Standard_NK24': { SKU: 'Standard_NK24', GPUCount: 4, GPUMemGB: 32, GPUModel: 'NVIDIA T4' }
  };

  const clusters = [
    { name: 'aks-prod-eastus', location: 'East US', resourceGroup: 'rg-prod-east', gpus: '4x NVIDIA T4', nodes: '3' },
    { name: 'aks-dev-westus', location: 'West US', resourceGroup: 'rg-dev-west', gpus: '2x NVIDIA T4', nodes: '2' },
    { name: 'aks-staging-central', location: 'Central US', resourceGroup: 'rg-staging', gpus: '8x NVIDIA T4', nodes: '6' }
  ];

  const filteredModels = Object.entries(modelData).filter(([key, model]) => {
    if (!modelSearchQuery) return true;
    const query = modelSearchQuery.toLowerCase();
    return model.name.toLowerCase().includes(query) || 
           model.description.toLowerCase().includes(query);
  });

  const nextStep = () => {
    if (currentStep < 3) {
      if (currentStep === 1 && !selectedModel) return;
      if (currentStep === 2 && !selectedCluster) return;
      setCurrentStep(currentStep + 1);
    } else {
      deployModel();
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectModel = (modelKey: string) => {
    setSelectedModel(modelKey);
  };

  const selectCluster = (clusterName: string) => {
    setSelectedCluster(clusterName);
  };

  const updateDeploymentConfig = (updates: Partial<DeploymentConfig>) => {
    setDeploymentConfig(prev => ({ ...prev, ...updates }));
  };

  const generateYAML = () => {
    const modelName = selectedModel ? selectedModel.replace('/', '-').replace('microsoft-', '').replace('meta-', '').replace('mistralai-', '') : 'model';
    const workspaceName = `workspace-${deploymentConfig.name.toLowerCase().replace(/\s+/g, '-')}`;
    const configMapName = `${modelName}-inference-params`;
    
    return `apiVersion: kaito.sh/v1beta1
kind: Workspace
metadata:
  name: ${workspaceName}
spec:
  resource:
    instanceType: "${deploymentConfig.instanceType}"
    labelSelector:
      matchLabels:
        app: ${modelName}
  inference:
    preset:
      name: "${selectedModel || 'model-name'}"
    config: "${configMapName}"
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ${configMapName}
data:
  inference_config.yaml: |
    # Maximum number of steps to find the max available seq len fitting in the GPU memory.
    max_probe_steps: 6

    vllm:
      cpu-offload-gb: 0
      gpu-memory-utilization: ${deploymentConfig.gpuMemoryUtilization}
      swap-space: ${deploymentConfig.swapSpace}
      max-model-len: 131072
      tensor-parallel-size: ${Math.max(1, Math.floor(instanceTypes[deploymentConfig.instanceType]?.GPUCount / 2) || 1)}

      max-seq-len-to-capture: 8192
      num-scheduler-steps: 1
      enable-chunked-prefill: true
      # see https://docs.vllm.ai/en/latest/serving/engine_args.html for more options.`;
  };

  const deployModel = () => {
    // Store deployment configuration in localStorage for the progress page
    localStorage.setItem('selectedModel', selectedModel);
    localStorage.setItem('selectedCluster', selectedCluster);
    localStorage.setItem('instanceType', deploymentConfig.instanceType);
    localStorage.setItem('deploymentName', deploymentConfig.name);
    localStorage.setItem('replicas', deploymentConfig.replicas.toString());
    localStorage.setItem('memoryLimit', deploymentConfig.memoryLimit.toString());
    localStorage.setItem('cpuLimit', deploymentConfig.cpuLimit.toString());
    localStorage.setItem('gpuMemoryUtilization', deploymentConfig.gpuMemoryUtilization.toString());
    localStorage.setItem('swapSpace', deploymentConfig.swapSpace.toString());
    
    // Redirect to deployment progress page
    router.push(`/deployment-progress?model=${encodeURIComponent(selectedModel)}&cluster=${encodeURIComponent(selectedCluster)}&instance=${encodeURIComponent(deploymentConfig.instanceType)}`);
  };

  const getStepClass = (stepNumber: number) => {
    if (stepNumber < currentStep) return `${styles.step} ${styles.completed}`;
    if (stepNumber === currentStep) return `${styles.step} ${styles.active}`;
    return `${styles.step} ${styles.inactive}`;
  };

  const isNextDisabled = () => {
    if (currentStep === 1) return !selectedModel;
    if (currentStep === 2) return !selectedCluster;
    return false;
  };

  const getNextButtonText = () => {
    if (currentStep === 3) return 'Deploy Model';
    return 'Next Step';
  };

  return (
    <div className={styles.body}>
      <div className={styles.wizardContainer}>
        <div className={styles.wizardHeader}>
          <h1 className={styles.wizardTitle}>Kaito Model Deployment Wizard</h1>
          <p className={styles.wizardSubtitle}>Deploy AI models to your Kubernetes clusters with ease</p>
        </div>

        <div className={styles.stepIndicator}>
          <div className={getStepClass(1)}>
            <div className={styles.stepNumber}>1</div>
            <span>Model Selection</span>
          </div>
          <div className={getStepClass(2)}>
            <div className={styles.stepNumber}>2</div>
            <span>Cluster Selection</span>
          </div>
          <div className={getStepClass(3)}>
            <div className={styles.stepNumber}>3</div>
            <span>Review & Deploy</span>
          </div>
        </div>

        <div className={styles.wizardContent}>
          {/* Step 1: Model Selection */}
          {currentStep === 1 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Select AI Model</h2>
              <p className={styles.stepDescription}>Choose from our collection of pre-configured AI models optimized for deployment.</p>
              
              <div className={styles.searchBox}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search models..."
                  value={modelSearchQuery}
                  onChange={(e) => setModelSearchQuery(e.target.value)}
                />
              </div>

              <div className={styles.modelGrid}>
                {filteredModels.map(([key, model]) => (
                  <div
                    key={key}
                    className={`${styles.modelCard} ${selectedModel === key ? styles.selected : ''}`}
                    onClick={() => selectModel(key)}
                  >
                    <div className={styles.modelName}>{model.name}</div>
                    <div className={styles.modelDescription}>{model.description}</div>
                    <div className={styles.modelMetadata}>
                      <div className={styles.modelSize}>{model.size}</div>
                      <div className={styles.modelHardware}>{model.hardware}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Cluster Selection */}
          {currentStep === 2 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Select Deployment Target</h2>
              <p className={styles.stepDescription}>Choose the Kubernetes cluster where you want to deploy your model.</p>
              
              <div className={styles.deploymentSummary}>
                <div className={styles.summaryTitle}>Deployment Summary</div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Deployment Name:</span>
                  <span className={styles.summaryValue}>{deploymentConfig.name}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Selected Model:</span>
                  <span className={styles.summaryValue}>
                    {selectedModel ? modelData[selectedModel]?.name : 'None'}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Model Size:</span>
                  <span className={styles.summaryValue}>
                    {selectedModel ? modelData[selectedModel]?.size : '-'}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Instance Type:</span>
                  <span className={styles.summaryValue}>
                    {instanceTypes[deploymentConfig.instanceType] ? 
                      `${instanceTypes[deploymentConfig.instanceType].SKU} (${instanceTypes[deploymentConfig.instanceType].GPUCount} GPU, ${instanceTypes[deploymentConfig.instanceType].GPUMemGB}GB, ${instanceTypes[deploymentConfig.instanceType].GPUModel})` :
                      deploymentConfig.instanceType
                    }
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Configuration:</span>
                  <span className={styles.summaryValue}>
                    <button className={`${styles.button} ${styles.configure}`} onClick={() => setShowConfigModal(true)}>
                      Configure
                    </button>
                  </span>
                </div>
              </div>

              <div className={styles.clusterList}>
                {clusters.map((cluster) => (
                  <div
                    key={cluster.name}
                    className={`${styles.clusterItem} ${selectedCluster === cluster.name ? styles.selected : ''}`}
                    onClick={() => selectCluster(cluster.name)}
                  >
                    <div className={styles.clusterName}>{cluster.name}</div>
                    <div className={styles.clusterLocation}>{cluster.location} • {cluster.resourceGroup}</div>
                    <div className={styles.clusterSpecs}>
                      <div className={styles.specItem}>{cluster.gpus}</div>
                      <div className={styles.specItem}>{cluster.nodes} nodes</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Review & Deploy */}
          {currentStep === 3 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Review & Deploy</h2>
              <p className={styles.stepDescription}>Review your deployment configuration and generated YAML manifest.</p>
              
              <div className={styles.deploymentSummary}>
                <div className={styles.summaryTitle}>Final Deployment Summary</div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Deployment Name:</span>
                  <span className={styles.summaryValue}>{deploymentConfig.name}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Model:</span>
                  <span className={styles.summaryValue}>
                    {selectedModel ? modelData[selectedModel]?.name : 'None'}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Cluster:</span>
                  <span className={styles.summaryValue}>{selectedCluster}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Instance Type:</span>
                  <span className={styles.summaryValue}>
                    {instanceTypes[deploymentConfig.instanceType] ? 
                      `${instanceTypes[deploymentConfig.instanceType].SKU} (${instanceTypes[deploymentConfig.instanceType].GPUCount} GPU, ${instanceTypes[deploymentConfig.instanceType].GPUMemGB}GB, ${instanceTypes[deploymentConfig.instanceType].GPUModel})` :
                      deploymentConfig.instanceType
                    }
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Replicas:</span>
                  <span className={styles.summaryValue}>{deploymentConfig.replicas}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Memory Limit:</span>
                  <span className={styles.summaryValue}>{deploymentConfig.memoryLimit} GB</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>CPU Limit:</span>
                  <span className={styles.summaryValue}>{deploymentConfig.cpuLimit} cores</span>
                </div>
              </div>

              <div className={styles.yamlSection}>
                <h3 className={styles.yamlTitle}>Generated YAML Manifest</h3>
                <pre className={styles.yamlPreview}>{generateYAML()}</pre>
              </div>
            </div>
          )}
        </div>

        <div className={styles.wizardActions}>
          {currentStep > 1 && (
            <button className={`${styles.button} ${styles.secondary}`} onClick={previousStep}>
              Previous Step
            </button>
          )}
          <button 
            className={`${styles.button} ${styles.primary}`} 
            onClick={nextStep}
            disabled={isNextDisabled()}
          >
            {getNextButtonText()}
          </button>
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Advanced Configuration</h3>
              <button className={styles.closeButton} onClick={() => setShowConfigModal(false)}>×</button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Instance Type</label>
                <select 
                  className={styles.formSelect}
                  value={deploymentConfig.instanceType}
                  onChange={(e) => updateDeploymentConfig({ instanceType: e.target.value })}
                >
                  {Object.entries(instanceTypes).map(([key, instance]) => (
                    <option key={key} value={key}>
                      {instance.SKU} ({instance.GPUCount} GPU, {instance.GPUMemGB}GB, {instance.GPUModel})
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Replicas</label>
                <input 
                  type="number"
                  className={styles.formInput}
                  value={deploymentConfig.replicas}
                  onChange={(e) => updateDeploymentConfig({ replicas: parseInt(e.target.value) })}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Memory Limit (GB)</label>
                <input 
                  type="number"
                  className={styles.formInput}
                  value={deploymentConfig.memoryLimit}
                  onChange={(e) => updateDeploymentConfig({ memoryLimit: parseInt(e.target.value) })}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>CPU Limit (cores)</label>
                <input 
                  type="number"
                  className={styles.formInput}
                  value={deploymentConfig.cpuLimit}
                  onChange={(e) => updateDeploymentConfig({ cpuLimit: parseInt(e.target.value) })}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>GPU Memory Utilization</label>
                <input 
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  className={styles.formInput}
                  value={deploymentConfig.gpuMemoryUtilization}
                  onChange={(e) => updateDeploymentConfig({ gpuMemoryUtilization: parseFloat(e.target.value) })}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Swap Space (GB)</label>
                <input 
                  type="number"
                  className={styles.formInput}
                  value={deploymentConfig.swapSpace}
                  onChange={(e) => updateDeploymentConfig({ swapSpace: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={`${styles.button} ${styles.secondary}`} onClick={() => setShowConfigModal(false)}>
                Cancel
              </button>
              <button className={`${styles.button} ${styles.primary}`} onClick={() => setShowConfigModal(false)}>
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeploymentWizard;
