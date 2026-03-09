'use client'
import Navbar from '../components/Navbar'
import AdminBar from '../components/AdminBar'  // ← add this
import { useState } from 'react'

export default function MainLayout({ children }) {
    const [cartCount, setCartCount] = useState(0)

    return (
        <>
            <Navbar cartCount={cartCount} />
            <main>{children}</main>
            <AdminBar />  {/* ← add this */}
        </>
    )
}