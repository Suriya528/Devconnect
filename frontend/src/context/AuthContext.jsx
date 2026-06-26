import {  createContext, useContext, useEffect, useState } from "react";

const AuthContext=createContext()
export const AuthProvider=({children})=>{
    const [user,setuser]=useState(null)
    const [token,settoken]=useState(localStorage.getItem('token') || null )
    const [loading,setloading]=useState(true)
    useEffect(()=>{
        const storedUser=localStorage.getItem('user')
        if(storedUser){
            setuser(JSON.parse(storedUser))
        }
        setloading(false)
    },[])

    const login=(userData,tokenData)=>{
        setuser(userData)
        settoken(tokenData)
        localStorage.setItem('user',JSON.stringify(userData))
        localStorage.setItem('token',tokenData)
    }
    const logout=()=>{
        setuser(null)
        settoken(null)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
    }
    return(
        <AuthContext.Provider value={{user,token,login,logout,loading}}>
            {children}

        </AuthContext.Provider>
    )
}
export const useAuth=()=>useContext(AuthContext)