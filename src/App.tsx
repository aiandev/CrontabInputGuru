import React, { useState } from 'react'
import { CrontabInputGuru } from './lib'

export default function App() {
  const [value, setValue] = useState('* * * * *')
  return (
    <CrontabInputGuru locale='en' value={value} onChange={setValue} />

  )
}
