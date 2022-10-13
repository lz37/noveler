import React from 'react'
import { createRoot } from 'react-dom/client'
import APP from './components/APP'

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(<APP />)
