import React from 'react'


const Dashboard = () => {
  return (
    <div className='max-w-4xl mx-auto mt-10 px-4'>
        <h1 className='text-2xl font-bold text-gray-800'>Welcome back, {user?.name}!</h1>
        <p className='text-gray-500 mt-2'>{user?.role}</p>
    </div>
  )
}

export default Dashboard