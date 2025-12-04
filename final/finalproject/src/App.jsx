import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter } from "react-router-dom"

function App() {

  return (
    <>
      {/* Router는 주소에 의한 화면 분할을 처리하는 도구이며 설정된 영역 내에서만 작동함 */}
      <BrowserRouter>
        <div className="container-fluid my-5 pt-5">
          <Content/>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
