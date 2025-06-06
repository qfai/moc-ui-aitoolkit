'use client'

import React, { useState } from 'react'
import styles from './finetune-wizard.module.css'

interface Model {
  id: string
  name: string
  description: string
  size: string
  tuningSupport: string
}

interface FineTuningConfig {
  method: 'lora' | 'qlora' | 'full' | ''
  learningRate: string
  batchSize: string
  epochs: string
  maxLength: string
  datasetPath: string
  validationSplit: string
  outputDir: string
  saveSteps: string
  evaluationSteps: string
  warmupSteps: string
  weightDecay: string
  gradientAccumulation: string
}

const models: Model[] = [
  {
    id: 'llama2-7b',
    name: 'Llama 2 7B',
    description: 'A 7 billion parameter language model by Meta, optimized for chat and instruction following.',
    size: '7B',
    tuningSupport: 'LoRA, QLoRA, Full'
  },
  {
    id: 'llama2-13b',
    name: 'Llama 2 13B',
    description: 'A larger 13 billion parameter version with improved performance on complex tasks.',
    size: '13B',
    tuningSupport: 'LoRA, QLoRA'
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    description: 'High-performance 7B model with excellent reasoning capabilities and code generation.',
    size: '7B',
    tuningSupport: 'LoRA, QLoRA, Full'
  },
  {
    id: 'codellama-7b',
    name: 'Code Llama 7B',
    description: 'Specialized for code generation, debugging, and programming assistance tasks.',
    size: '7B',
    tuningSupport: 'LoRA, QLoRA, Full'
  },
  {
    id: 'phi-3-mini',
    name: 'Phi-3 Mini',
    description: 'Compact 3.8B parameter model with strong performance on reasoning and math.',
    size: '3.8B',
    tuningSupport: 'LoRA, QLoRA, Full'
  },
  {
    id: 'deepseek-coder-6.7b',
    name: 'DeepSeek Coder 6.7B',
    description: 'Specialized coding model with excellent performance on programming tasks.',
    size: '6.7B',
    tuningSupport: 'LoRA, QLoRA, Full'
  }
]

const tuningMethods = [
  {
    id: 'lora',
    name: 'LoRA',
    description: 'Low-Rank Adaptation - Efficient fine-tuning by updating only low-rank matrices. Fastest and most memory efficient.'
  },
  {
    id: 'qlora',
    name: 'QLoRA',
    description: 'Quantized LoRA - Combines 4-bit quantization with LoRA for maximum memory efficiency on consumer GPUs.'
  },
  {
    id: 'full',
    name: 'Full Fine-tuning',
    description: 'Traditional fine-tuning that updates all model parameters. Highest quality but requires significant compute resources.'
  }
]

export default function FineTuneWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [config, setConfig] = useState<FineTuningConfig>({
    method: '',
    learningRate: '2e-4',
    batchSize: '4',
    epochs: '3',
    maxLength: '2048',
    datasetPath: '',
    validationSplit: '0.1',
    outputDir: './output',
    saveSteps: '500',
    evaluationSteps: '100',
    warmupSteps: '100',
    weightDecay: '0.01',
    gradientAccumulation: '4'
  })

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleConfigChange = (field: keyof FineTuningConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedModel !== ''
      case 2:
        return config.method !== ''
      case 3:
        return config.datasetPath.trim() !== ''
      default:
        return true
    }
  }

  const startFineTuning = () => {
    // Here you would typically start the fine-tuning process
    localStorage.setItem('fineTuningConfig', JSON.stringify({
      model: selectedModel,
      config: config
    }))
    alert('Fine-tuning job submitted! You will be redirected to the progress monitor.')
    // window.location.href = '/finetune-progress'
  }

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed'
    if (step === currentStep) return 'active'
    return 'inactive'
  }

  return (
    <div className={styles.wizardContainer}>
      <div className={styles.wizardHeader}>
        <div className={styles.wizardTitle}>Fine-Tune Your AI Model</div>
        <div className={styles.wizardSubtitle}>
          Customize a foundation model for your specific use case
        </div>
      </div>

      <div className={styles.stepIndicator}>
        {[
          { number: 1, label: 'Select Model' },
          { number: 2, label: 'Configuration' },
          { number: 3, label: 'Dataset' },
          { number: 4, label: 'Review' }
        ].map((step) => (
          <div key={step.number} className={`${styles.step} ${styles[getStepStatus(step.number)]}`}>
            <div className={styles.stepNumber}>{step.number}</div>
            <span>{step.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.wizardContent}>
        {/* Step 1: Model Selection */}
        {currentStep === 1 && (
          <div className={`${styles.stepContent} ${styles.active}`}>
            <div className={styles.stepTitle}>Choose a Base Model</div>
            <div className={styles.stepDescription}>
              Select the foundation model you want to fine-tune. Consider the model size, 
              your available compute resources, and the specific capabilities you need.
            </div>

            <div className={styles.searchBox}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className={styles.modelGrid}>
              {filteredModels.map((model) => (
                <div
                  key={model.id}
                  className={`${styles.modelCard} ${selectedModel === model.id ? styles.selected : ''}`}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <div className={styles.modelName}>{model.name}</div>
                  <div className={styles.modelDescription}>{model.description}</div>
                  <div className={styles.modelMetadata}>
                    <div className={styles.modelSize}>Parameters: {model.size}</div>
                    <div className={styles.modelTuningSupport}>{model.tuningSupport}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Fine-tuning Configuration */}
        {currentStep === 2 && (
          <div className={`${styles.stepContent} ${styles.active}`}>
            <div className={styles.stepTitle}>Fine-tuning Configuration</div>
            <div className={styles.stepDescription}>
              Choose your fine-tuning method and configure the training parameters.
            </div>

            <div className={styles.configSection}>
              <div className={styles.configTitle}>
                <div className={styles.configIcon}></div>
                Fine-tuning Method
              </div>
              
              <div className={styles.methodSelection}>
                {tuningMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`${styles.methodCard} ${config.method === method.id ? styles.selected : ''}`}
                    onClick={() => handleConfigChange('method', method.id as FineTuningConfig['method'])}
                  >
                    <div className={styles.methodName}>{method.name}</div>
                    <div className={styles.methodDescription}>{method.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.configSection}>
              <div className={styles.configTitle}>
                <div className={styles.configIcon}></div>
                Training Parameters
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Learning Rate</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={config.learningRate}
                    onChange={(e) => handleConfigChange('learningRate', e.target.value)}
                  />
                  <div className={styles.formHelp}>Recommended: 2e-4 for LoRA, 1e-5 for full fine-tuning</div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Batch Size</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={config.batchSize}
                    onChange={(e) => handleConfigChange('batchSize', e.target.value)}
                  />
                  <div className={styles.formHelp}>Adjust based on your GPU memory</div>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Training Epochs</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={config.epochs}
                    onChange={(e) => handleConfigChange('epochs', e.target.value)}
                  />
                  <div className={styles.formHelp}>Number of complete passes through the dataset</div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Max Sequence Length</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={config.maxLength}
                    onChange={(e) => handleConfigChange('maxLength', e.target.value)}
                  />
                  <div className={styles.formHelp}>Maximum input/output length in tokens</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Dataset Configuration */}
        {currentStep === 3 && (
          <div className={`${styles.stepContent} ${styles.active}`}>
            <div className={styles.stepTitle}>Dataset Configuration</div>
            <div className={styles.stepDescription}>
              Specify your training dataset and configure data processing parameters.
            </div>

            <div className={styles.datasetInput}>
              <div className={styles.configTitle}>
                <div className={styles.configIcon}></div>
                Training Data
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Dataset Path</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g., /mnt/data/training.jsonl or gs://bucket/data.jsonl"
                  value={config.datasetPath}
                  onChange={(e) => handleConfigChange('datasetPath', e.target.value)}
                />
                <div className={styles.formHelp}>
                  Path to your training dataset (JSONL format recommended)
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Validation Split</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    className={styles.formInput}
                    value={config.validationSplit}
                    onChange={(e) => handleConfigChange('validationSplit', e.target.value)}
                  />
                  <div className={styles.formHelp}>Fraction of data to use for validation</div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Output Directory</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={config.outputDir}
                    onChange={(e) => handleConfigChange('outputDir', e.target.value)}
                  />
                  <div className={styles.formHelp}>Where to save the fine-tuned model</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className={`${styles.stepContent} ${styles.active}`}>
            <div className={styles.stepTitle}>Review Configuration</div>
            <div className={styles.stepDescription}>
              Review your fine-tuning configuration before starting the training process.
            </div>

            <div className={styles.configSection}>
              <div className={styles.configTitle}>Selected Model</div>
              <div>{models.find(m => m.id === selectedModel)?.name}</div>
            </div>

            <div className={styles.configSection}>
              <div className={styles.configTitle}>Fine-tuning Method</div>
              <div>{tuningMethods.find(m => m.id === config.method)?.name}</div>
            </div>

            <div className={styles.configSection}>
              <div className={styles.configTitle}>Training Configuration</div>
              <div className={styles.formRow}>
                <div>Learning Rate: {config.learningRate}</div>
                <div>Batch Size: {config.batchSize}</div>
                <div>Epochs: {config.epochs}</div>
              </div>
            </div>

            <div className={styles.configSection}>
              <div className={styles.configTitle}>Dataset</div>
              <div>Path: {config.datasetPath}</div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.wizardActions}>
        <button
          className={`${styles.button} ${styles.secondary}`}
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          Previous
        </button>
        
        <div className={styles.rightButtons}>
          {currentStep < 4 ? (
            <button
              className={`${styles.button} ${styles.primary}`}
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
            </button>
          ) : (
            <button
              className={`${styles.button} ${styles.success}`}
              onClick={startFineTuning}
            >
              Start Fine-tuning
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
