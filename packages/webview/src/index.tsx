import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import 'antd/dist/reset.css'
import './styles/global.css'

if (!showScrollbar) {
  document.body.classList.add('hide-scrollbar')
}

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
