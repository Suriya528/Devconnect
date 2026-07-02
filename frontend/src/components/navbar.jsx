import { Link,useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const Navbar=()=>{
    const {user,logout}=useAuth()
    const navigate=useNavigate()
    const handlelogout=()=>{
        logout()
        navigate('/login')
    }
    return (
        <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
            <Link to='/' className="text-x1 font-bold text-blue-400">
            Devconnect
            </Link>
            <div className="flex gap-4 items-center">
                {user ?(
                    <>
                    <span className="text-gray-300 text-sm">hi,{user?.firstName}</span>
                    <Link to="/dashboard" className="hover:text-blue-400">Dashboard</Link>
                    <button onClick={handlelogout} 
                    className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-sm">
                        Logout

                    </button>
                    </>
                ):(
                    <>
                    <Link to="/login" className="hover:text-blue-400">Login</Link>
                    <Link to="/register" className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 text-sm">Register</Link>
                    <Link to='/feed' className="hover:text-blue-400 text-sm">Feed</Link>
                    </>
                )}
            
            </div>        
        </nav>
    )
}
export default Navbar