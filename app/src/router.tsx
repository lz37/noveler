import { createMemoryRouter, Link } from 'react-router-dom'
import Preview from '@app/components/Preview'
import React from 'react'

export const router = createMemoryRouter([
  {
    path: '/',
    element: <Preview />,
  },
  {
    path: '/test',
    element: <div>test</div>,
  },
])
