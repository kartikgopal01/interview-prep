import {ReactNode} from 'react'
import "../globals.css";

const Authlayout = ({children}: {children: ReactNode}) => {
  return (
    <div className='auth-layout'>
      {children}
    </div>
  )
}

export default Authlayout
