import React from 'react'
import { createRoot } from 'react-dom/client'
import APP from '@app/components/APP'
import './styles/global.css'

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(<APP />)
