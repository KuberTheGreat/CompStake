import React from 'react'
import { getTasks } from '@/utils/functions'

const FetchTasks = () => {
    const {tasks} = getTasks(BigInt(1));
    
  return (
    <div>
      {tasks?.toString()}
    </div>
  )
}

export default FetchTasks
