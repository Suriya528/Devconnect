import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProctedRoute=({children})=>{
    const {user,loading}=useAuth()

    if(loading){
        return <div className="text-cente mt-20">Loading....</div>
    }
    if(!user) return <Navigate to="/login"/>
    return children
}
export default ProctedRoute