import React, { useEffect } from 'react'
import listen from '@web/lib/listen'

export default () => {
  useEffect(() => {
    window.addEventListener('message', listen)
    return () => {
      window.removeEventListener('message', listen)
    }
  }, [])
  return <>preview</>
}
