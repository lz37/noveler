import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import 'antd/dist/reset.css'
import GlobalStyles from './lib/GlobalStyles'
import { App } from 'antd'

if (!showScrollbar) {
  document.body.classList.add('hide-scrollbar')
}

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(
  <App>
    <GlobalStyles />
    <RouterProvider router={router} />
  </App>,
)
