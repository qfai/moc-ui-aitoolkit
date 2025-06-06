'use client'

import React, { useState, useEffect } from 'react'
import styles from './deployment-progress.module.css'

interface LogEntry {
  time: string
  level: 'info' | 'warn' | 'error'
  message: string
}

interface DeploymentStep {
  id: string
  title: string
  description: string
  details: string
  duration: number
  logs: LogEntry[]
}

const steps: DeploymentStep[] = [
  {
    id: 'step1',
    title: 'Checking Cluster Extensions',
    description: 'Verifying that the Kaito extension is installed on the target cluster',
    details: 'Connecting to cluster: prod-east-cluster\nChecking for extension: microsoft.machinelearning.kaito',
    duration: 3000,
    logs: [
      { time: '10:30:16', level: 'info', message: 'Connecting to cluster prod-east-cluster...' },
      { time: '10:30:17', level: 'info', message: 'Checking for Kaito extension...' },
      { time: '10:30:18', level: 'info', message: 'Extension not found, installation required' }
    ]
  },
  {
    id: 'step2',
    title: 'Installing Required Extensions',
    description: 'Installing Kaito extension on the cluster if not present',
    details: 'Installing extension: microsoft.machinelearning.kaito\nVersion: 0.3.0',
    duration: 4000,
    logs: [
      { time: '10:30:19', level: 'info', message: 'Installing microsoft.machinelearning.kaito extension...' },
      { time: '10:30:21', level: 'info', message: 'Extension installation in progress...' },
      { time: '10:30:23', level: 'info', message: 'Extension installed successfully' }
    ]
  },
  {
    id: 'step3',
    title: 'Generating Configuration',
    description: 'Creating Kubernetes manifests based on your deployment settings',
    details: 'Generating Workspace manifest\nCreating ConfigMap for inference parameters',
    duration: 2000,
    logs: [
      { time: '10:30:24', level: 'info', message: 'Generating Workspace manifest...' },
      { time: '10:30:25', level: 'info', message: 'Creating ConfigMap for inference parameters...' },
      { time: '10:30:26', level: 'info', message: 'Configuration files generated successfully' }
    ]
  },
  {
    id: 'step4',
    title: 'Applying Configuration',
    description: 'Deploying the model configuration to your cluster',
    details: 'kubectl apply -f workspace-deepseek-r1-distill-qwen-14b.yaml\nkubectl apply -f ds-inference-params-configmap.yaml',
    duration: 3000,
    logs: [
      { time: '10:30:27', level: 'info', message: 'Applying workspace configuration...' },
      { time: '10:30:28', level: 'info', message: 'Applying ConfigMap...' },
      { time: '10:30:29', level: 'info', message: 'Resources created successfully' }
    ]
  },
  {
    id: 'step5',
    title: 'Waiting for Pod Readiness',
    description: 'Monitoring the deployment until the model is ready to serve requests',
    details: 'Waiting for pods to be in Running state\nChecking readiness probes',
    duration: 5000,
    logs: [
      { time: '10:30:30', level: 'info', message: 'Waiting for pods to be scheduled...' },
      { time: '10:30:32', level: 'info', message: 'Pods are being created...' },
      { time: '10:30:34', level: 'info', message: 'Model container is starting...' },
      { time: '10:30:35', level: 'info', message: 'Deployment completed successfully!' }
    ]
  }
]

const defaultYamlContent = `apiVersion: kaito.sh/v1beta1
kind: Workspace
metadata:
  name: workspace-deepseek-r1-distill-qwen-14b
resource:
  instanceType: "Standard_NC24ads_A100_v4"
  labelSelector:
    matchLabels:
      apps: deepseek-r1-distill-qwen-14b
inference:
  preset:
    name: "deepseek-r1-distill-qwen-14b"
  config: "ds-inference-params"
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ds-inference-params
data:
  inference_config.yaml: |
    # Maximum number of steps to find the max available seq len fitting in the GPU memory.
    max_probe_steps: 6

    vllm:
      cpu-offload-gb: 0
      gpu-memory-utilization: 0.95
      swap-space: 4
      max-model-len: 131072
      tensor-parallel-size: 2

      max-seq-len-to-capture: 8192
      num-scheduler-steps: 1
      enable-chunked-prefill: true
      # see https://docs.vllm.ai/en/latest/serving/engine_args.html for more options.`

export default function DeploymentProgress() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [failedSteps, setFailedSteps] = useState<number[]>([])
  const [deploymentCompleted, setDeploymentCompleted] = useState(false)
  const [deploymentCancelled, setDeploymentCancelled] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([
    { time: '10:30:15', level: 'info', message: 'Starting deployment process...' }
  ])
  const [showLogs, setShowLogs] = useState(false)
  const [showYaml, setShowYaml] = useState(false)
  const [deploymentConfig, setDeploymentConfig] = useState({
    modelName: 'deepseek-r1-distill-qwen-14b',
    clusterName: 'prod-east-cluster',
    instanceType: 'Standard_NC24ads_A100_v4'
  })

  useEffect(() => {
    // Load deployment config from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search)
    const modelName = urlParams.get('model') || localStorage.getItem('selectedModel') || 'deepseek-r1-distill-qwen-14b'
    const clusterName = urlParams.get('cluster') || localStorage.getItem('selectedCluster') || 'prod-east-cluster'
    const instanceType = urlParams.get('instance') || localStorage.getItem('instanceType') || 'Standard_NC24ads_A100_v4'
    
    setDeploymentConfig({ modelName, clusterName, instanceType })
  }, [])

  useEffect(() => {
    // Start deployment process
    if (!deploymentCancelled && currentStep < steps.length) {
      const timer = setTimeout(() => {
        // Add logs for current step
        const stepLogs = steps[currentStep].logs
        stepLogs.forEach((log, index) => {
          setTimeout(() => {
            setLogs(prevLogs => [...prevLogs, log])
          }, index * 200)
        })

        // Complete current step after duration
        setTimeout(() => {
          if (!deploymentCancelled) {
            setCompletedSteps(prev => [...prev, currentStep])
            setCurrentStep(prev => prev + 1)
          }
        }, steps[currentStep].duration)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (currentStep >= steps.length && !deploymentCancelled) {
      setDeploymentCompleted(true)
    }
  }, [currentStep, deploymentCancelled])

  const addLogEntry = (time: string, level: 'info' | 'warn' | 'error', message: string) => {
    setLogs(prevLogs => [...prevLogs, { time, level, message }])
  }

  const cancelDeployment = () => {
    setDeploymentCancelled(true)
    setFailedSteps([currentStep])
    addLogEntry('10:30:35', 'warn', 'Deployment cancelled by user')
    alert('Deployment cancelled. You will be redirected back to the deployment wizard.')
  }

  const finishDeployment = () => {
    alert('Redirecting to deployment overview...')
    // Here you would typically redirect to the deployed models view
    // window.location.href = '/edge-tab#deployed-models'
  }

  const getStepStatus = (stepIndex: number) => {
    if (failedSteps.includes(stepIndex)) return 'failed'
    if (completedSteps.includes(stepIndex)) return 'completed'
    if (stepIndex === currentStep && !deploymentCancelled) return 'active'
    return 'pending'
  }

  const getOverallStatus = () => {
    if (deploymentCancelled) return { text: 'Cancelled', className: 'status-failed' }
    if (deploymentCompleted) return { text: 'Completed', className: 'status-completed' }
    return { text: 'Deploying', className: 'status-running' }
  }

  const getStepIcon = (stepIndex: number) => {
    const status = getStepStatus(stepIndex)
    switch (status) {
      case 'active':
        return <div className={styles.spinner}></div>
      case 'completed':
        return <span className={styles.checkmark}>✓</span>
      case 'failed':
        return '✗'
      default:
        return stepIndex + 1
    }
  }

  const overallStatus = getOverallStatus()

  return (
    <div className={styles.deploymentContainer}>
      <div className={styles.deploymentHeader}>
        <div className={styles.deploymentTitle}>Deploying AI Model</div>
        <div className={styles.deploymentSubtitle}>Setting up your model on the edge cluster</div>
      </div>

      <div className={styles.deploymentContent}>
        <div className={styles.deploymentSummary}>
          <div className={styles.summaryTitle}>Deployment Configuration</div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Model:</span>
            <span className={styles.summaryValue}>{deploymentConfig.modelName}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Cluster:</span>
            <span className={styles.summaryValue}>{deploymentConfig.clusterName}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Instance Type:</span>
            <span className={styles.summaryValue}>{deploymentConfig.instanceType}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Status:</span>
            <span className={`${styles.statusIndicator} ${styles[overallStatus.className]}`}>
              {overallStatus.text}
            </span>
          </div>
        </div>

        <div className={styles.deploymentSteps}>
          {steps.map((step, index) => {
            const status = getStepStatus(index)
            return (
              <div key={step.id} className={`${styles.stepItem} ${styles[status]}`}>
                <div className={styles.stepIcon}>
                  {getStepIcon(index)}
                </div>
                <div className={styles.stepContent}>
                  <div className={styles.stepTitle}>{step.title}</div>
                  <div className={styles.stepDescription}>{step.description}</div>
                  {(status === 'active' || status === 'completed') && (
                    <div className={styles.stepDetails}>
                      {step.details.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {showYaml && (
          <div className={styles.yamlPreview}>
            <pre>{defaultYamlContent}</pre>
          </div>
        )}

        {showLogs && (
          <div className={styles.logsContainer}>
            {logs.map((log, index) => (
              <div key={index} className={styles.logEntry}>
                <span className={styles.logTimestamp}>[2025-06-04 {log.time}]</span>
                <span className={`${styles.logLevel} ${styles[`logLevel${log.level.charAt(0).toUpperCase() + log.level.slice(1)}`]}`}>
                  [{log.level.toUpperCase()}]
                </span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.deploymentActions}>
        <button 
          className={`${styles.button} ${styles.secondary}`}
          onClick={() => setShowLogs(!showLogs)}
        >
          {showLogs ? 'Hide Logs' : 'View Logs'}
        </button>
        <div>
          <button 
            className={`${styles.button} ${styles.secondary}`}
            onClick={() => setShowYaml(!showYaml)}
          >
            {showYaml ? 'Hide YAML' : 'View YAML'}
          </button>
          {deploymentCompleted && (
            <button 
              className={`${styles.button} ${styles.primary}`}
              onClick={finishDeployment}
            >
              View Deployment
            </button>
          )}
          <button 
            className={`${styles.button} ${styles.secondary}`}
            onClick={cancelDeployment}
          >
            {deploymentCancelled ? 'Back to Wizard' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}
