import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProctedRoute=({children})=>{
    const {user,loading}=useAuth()
    const location=useLocation()

    if(loading){
        return (<div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-blue-400 text-xl font-semibold animate-pulse">
        Loading....</div>
        </div>
        )}
    if(!user) return <Navigate to="/login" state={{from: location}} replace/>
    return children
}
export default ProctedRoute