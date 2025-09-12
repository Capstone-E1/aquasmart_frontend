import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Button } from './components'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-8 py-16 flex flex-col items-center justify-center min-h-screen">
        <div className="flex gap-8 mb-12">
          <a href="https://vite.dev" target="_blank" className="block group">
            <img 
              src={viteLogo} 
              className="h-24 p-6 transition-all duration-300 group-hover:drop-shadow-[0_0_2em_#646cffaa] will-change-transform group-hover:scale-110" 
              alt="Vite logo" 
            />
          </a>
          <a href="https://react.dev" target="_blank" className="block group">
            <img 
              src={reactLogo} 
              className="h-24 p-6 transition-all duration-300 group-hover:drop-shadow-[0_0_2em_#61dafbaa] will-change-transform motion-safe:animate-spin-slow group-hover:scale-110" 
              alt="React logo" 
            />
          </a>
        </div>
        
        <h1 className="text-6xl font-bold mb-4 leading-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Vite + React
        </h1>
        
        <p className="text-xl text-gray-300 mb-12 text-center max-w-2xl">
          Now powered by <span className="text-cyan-400 font-semibold">Tailwind CSS</span> for rapid UI development
        </p>
        
        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Button onClick={() => setCount(count + 1)} variant="primary">
              Count is {count}
            </Button>
            <Button onClick={() => setCount(0)} variant="secondary" size="sm">
              Reset
            </Button>
          </div>
          <p className="mt-6 text-center text-gray-300">
            Edit <code className="bg-gray-700/70 px-2 py-1 rounded text-sm text-cyan-300 font-mono">src/App.tsx</code> and save to test HMR
          </p>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">
            Click on the Vite and React logos to learn more
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30">
              React 19
            </span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
              Vite 7
            </span>
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm border border-cyan-500/30">
              Tailwind CSS
            </span>
            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30">
              TypeScript
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
