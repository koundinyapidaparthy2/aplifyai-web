import React from 'react'
import { Button, Card } from '@aplifyai/ui'

function App() {
    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600">AplifyAI Desktop</h1>

            <Card className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-xl">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Welcome Back</h2>
                <p className="mb-6 text-gray-600">
                    Your AI Copilot is ready to help you land your dream job.
                </p>
                <div className="flex justify-center">
                    <Button onClick={() => console.log('Clicked!')} variant="primary">
                        Get Started
                    </Button>
                </div>
            </Card>
        </div>
    )
}

export default App
