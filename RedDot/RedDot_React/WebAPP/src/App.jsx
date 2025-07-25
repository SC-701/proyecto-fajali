
import './styles/app.css'
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom' 
import Login from './pages/Login'
import Register from './pages/Register'
import { HomePage } from './pages/HomePage'

function App() {
  

  return (
    <>
    <BrowserRouter>
          
              <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/tournaments" element={<div>Tournaments Page</div>} />
                  <Route path="/inscriptions" element={<div>Inscriptions Page</div>} />
                  <Route path="/results" element={<div>Results Page</div>} />
                  <Route path="/home" element={<HomePage/>} />
               
              </Routes>
          
    </BrowserRouter>
    </>
  )
}

export default App
