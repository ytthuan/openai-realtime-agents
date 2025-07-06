'use client';

import { useState } from 'react';

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  tips: string[];
}

export default function OnboardingTutorial({ onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Agent Configuration Manager',
      description: 'Let\'s walk through creating your first AI agent configuration',
      content: (
        <div className="text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Build Powerful Multi-Agent Systems
          </h3>
          <p className="text-gray-600 mb-6">
            Create custom AI agent configurations with specialized roles, seamless handoffs, 
            and intelligent conversation flows. Perfect for customer service, support systems, 
            and interactive applications.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 text-left">
            <h4 className="font-medium text-blue-900 mb-2">What you'll learn:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✓ How to create and configure AI agents</li>
              <li>✓ Setting up agent handoffs and workflows</li>
              <li>✓ Best practices for agent instructions</li>
              <li>✓ Exporting and importing configurations</li>
            </ul>
          </div>
        </div>
      ),
      tips: [
        'This tutorial takes about 5 minutes to complete',
        'You can skip it anytime and access help later',
        'All configurations are saved automatically'
      ]
    },
    {
      id: 'configuration-basics',
      title: 'Configuration Basics',
      description: 'Understanding the structure of agent configurations',
      content: (
        <div>
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Configuration Structure</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Configuration Info</h5>
                    <p className="text-sm text-gray-600">Name, description, and metadata about your agent system</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Individual Agents</h5>
                    <p className="text-sm text-gray-600">Each agent with specific roles, instructions, and capabilities</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Handoff Logic</h5>
                    <p className="text-sm text-gray-600">Rules for when agents transfer conversations to each other</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h4 className="font-medium text-yellow-800">Key Concept</h4>
              </div>
              <p className="text-sm text-yellow-700">
                Think of each agent as a specialist team member. They have specific expertise and know when to involve their colleagues.
              </p>
            </div>
          </div>
        </div>
      ),
      tips: [
        'Start with 2-3 agents for your first configuration',
        'Each agent should have a clear, specific role',
        'Good agent names help users understand the system'
      ]
    },
    {
      id: 'agent-creation',
      title: 'Creating Agents',
      description: 'Learn how to create and configure individual agents',
      content: (
        <div>
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-4">Agent Configuration Fields</h4>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <h5 className="font-medium text-gray-900">Agent Name</h5>
                </div>
                <p className="text-sm text-gray-600 mb-2">A clear, descriptive name for the agent's role</p>
                <div className="bg-gray-50 rounded p-2 text-sm font-mono text-gray-700">
                  Examples: "Customer Service", "Technical Support", "Billing Agent"
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <h5 className="font-medium text-gray-900">Voice Style</h5>
                </div>
                <p className="text-sm text-gray-600 mb-2">Choose the voice characteristics that match the agent's personality</p>
                <div className="bg-gray-50 rounded p-2 text-sm text-gray-700">
                  Options: Alloy (balanced), Echo (dynamic), Sage (measured), Nova (energetic)
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h5 className="font-medium text-gray-900">Instructions</h5>
                </div>
                <p className="text-sm text-gray-600 mb-2">Detailed instructions defining the agent's behavior and capabilities</p>
                <div className="bg-gray-50 rounded p-2 text-sm text-gray-700">
                  Include: Role, responsibilities, tone, limitations, and handoff triggers
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      tips: [
        'Be specific about what each agent can and cannot do',
        'Include examples of typical user requests in instructions',
        'Define clear boundaries to avoid agent confusion'
      ]
    },
    {
      id: 'handoffs',
      title: 'Setting Up Handoffs',
      description: 'Learn how agents can transfer conversations to each other',
      content: (
        <div>
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-4">Understanding Handoffs</h4>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-blue-800 text-sm mb-3">
                Handoffs allow agents to transfer users to other agents when they need specialized help or reach their limits.
              </p>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-700 font-bold text-xs">Agent A</span>
                  </div>
                  <p className="text-xs text-blue-700">Greeter</p>
                </div>
                <svg className="w-8 h-8 text-blue-400 mx-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-700 font-bold text-xs">Agent B</span>
                  </div>
                  <p className="text-xs text-green-700">Support</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-green-400 pl-4">
                <h5 className="font-medium text-gray-900 mb-1">✅ Good Handoff Example</h5>
                <p className="text-sm text-gray-600 mb-2">
                  "When a user asks about technical issues, transfer them to the Technical Support agent"
                </p>
                <div className="bg-green-50 rounded p-2 text-xs text-green-700">
                  Clear trigger → Specific target agent → Smooth transition
                </div>
              </div>

              <div className="border-l-4 border-red-400 pl-4">
                <h5 className="font-medium text-gray-900 mb-1">❌ Poor Handoff Example</h5>
                <p className="text-sm text-gray-600 mb-2">
                  "Sometimes transfer to other agents when needed"
                </p>
                <div className="bg-red-50 rounded p-2 text-xs text-red-700">
                  Vague trigger → No specific target → Confusing for users
                </div>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="font-medium text-yellow-800 mb-2">💡 Pro Tip</h5>
              <p className="text-sm text-yellow-700">
                Start with simple handoff patterns. You can always add complexity later as you test and refine your system.
              </p>
            </div>
          </div>
        </div>
      ),
      tips: [
        'Each agent should know when NOT to handle something',
        'Use handoff descriptions to help other agents understand roles',
        'Test handoff flows with realistic user scenarios'
      ]
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      description: 'Tips for creating effective agent configurations',
      content: (
        <div>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">📝 Writing Effective Instructions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <h5 className="font-medium text-green-800 mb-2">✅ Do This</h5>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Be specific about the agent's role</li>
                    <li>• Include example user requests</li>
                    <li>• Define clear boundaries</li>
                    <li>• Specify the tone and style</li>
                    <li>• Mention when to handoff</li>
                  </ul>
                </div>
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h5 className="font-medium text-red-800 mb-2">❌ Avoid This</h5>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Vague or generic instructions</li>
                    <li>• Overlapping responsibilities</li>
                    <li>• No clear handoff criteria</li>
                    <li>• Missing tone guidelines</li>
                    <li>• Contradictory rules</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">🏗️ System Architecture</h4>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">1</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-blue-900">Start Simple</h5>
                      <p className="text-sm text-blue-700">Begin with 2-3 agents and add more as needed</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">2</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-blue-900">Define Clear Roles</h5>
                      <p className="text-sm text-blue-700">Each agent should have a distinct, well-defined purpose</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">3</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-blue-900">Test Thoroughly</h5>
                      <p className="text-sm text-blue-700">Try different conversation paths and edge cases</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">💾 File Management</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>Regular Exports:</strong> Save configurations as JSON files for backup</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>Version Control:</strong> Keep track of changes with descriptive names</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>Documentation:</strong> Use clear names and descriptions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
      tips: [
        'Start with a simple 2-agent setup and expand gradually',
        'Test your configuration with real conversation scenarios',
        'Export your configurations regularly as backups'
      ]
    },
    {
      id: 'getting-started',
      title: 'Ready to Start!',
      description: 'You\'re all set to create your first agent configuration',
      content: (
        <div className="text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Congratulations! 🎉
          </h3>
          <p className="text-gray-600 mb-6">
            You now understand the basics of creating agent configurations. 
            Let's put this knowledge into practice by creating your first configuration.
          </p>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-indigo-900 mb-3">Quick Checklist for Your First Configuration:</h4>
            <div className="text-left space-y-2">
              <div className="flex items-center text-sm text-indigo-700">
                <svg className="w-4 h-4 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Choose a descriptive name and purpose
              </div>
              <div className="flex items-center text-sm text-indigo-700">
                <svg className="w-4 h-4 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Create 2-3 agents with clear roles
              </div>
              <div className="flex items-center text-sm text-indigo-700">
                <svg className="w-4 h-4 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Write detailed instructions for each agent
              </div>
              <div className="flex items-center text-sm text-indigo-700">
                <svg className="w-4 h-4 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Set up logical handoffs between agents
              </div>
              <div className="flex items-center text-sm text-indigo-700">
                <svg className="w-4 h-4 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Review and save your configuration
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Remember: You can always access the help guide later if you need a refresher!
          </p>
        </div>
      ),
      tips: [
        'Take your time with the first configuration',
        'You can always edit and improve it later',
        'Don\'t hesitate to experiment and iterate'
      ]
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{currentStepData.title}</h2>
              <p className="text-gray-600 mt-1">{currentStepData.description}</p>
            </div>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-blue-600 font-medium">
              {Math.round(progress)}% Complete
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {currentStepData.content}
          </div>

          {/* Tips Section */}
          {currentStepData.tips.length > 0 && (
            <div className="px-6 pb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h4 className="font-medium text-yellow-800">💡 Tips</h4>
                </div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {currentStepData.tips.map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>

            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <div className="space-x-3">
              <button
                onClick={onSkip}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Skip Tutorial
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
              >
                {currentStep === steps.length - 1 ? 'Start Creating!' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}