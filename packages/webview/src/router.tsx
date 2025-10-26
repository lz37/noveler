import {
  createMemoryRouter,
  IndexRouteObject,
  NonIndexRouteObject,
  Navigate,
} from 'react-router-dom'
import { NovelerRouter } from 'common/types'
import Preview from '@app/components/Preview'
import Panel from '@app/components/Panel'
import AIChat from '@app/components/AIChat'
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
  {
    path: '/ai-chat',
    element: <AIChat />,
    id: 'ai-chat',
  },
]

export default createMemoryRouter(routes)
