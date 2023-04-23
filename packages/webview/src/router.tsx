import { createMemoryRouter, IndexRouteObject, NonIndexRouteObject, Navigate } from 'react-router-dom'
import { NovelerRouter } from 'extension/src/common/types'
import Preview from './components/Preview'
import Panel from './components/Panel'
import React from 'react'

interface NovelerIndexRouteObject extends IndexRouteObject {
  path: NovelerRouter
}

interface NovelerNonIndexRouteObject extends NonIndexRouteObject {
  path: NovelerRouter
}

type NovelerRouteObject = NovelerIndexRouteObject | NovelerNonIndexRouteObject

const routes: NovelerRouteObject[] = [
  {
    path: '/',
    element: <Navigate to={home} />,
    id: 'home',
  },
  {
    path: '/preview',
    element: <Preview />,
    id: 'preview',
  },
  {
    path: '/panel',
    element: <Panel />,
    id: 'panel',
  },
]

export default createMemoryRouter(routes)
