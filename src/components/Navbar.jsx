// Navbar.jsx
import { useState } from 'react'
import DesktopNavbar from './DesktopNavbar'
import MobileNavbar from './MobileNavbar'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => setIsOpen(!isOpen)
    const closeMenu = () => setIsOpen(false)

    return (
        <nav className="w-full">
            <DesktopNavbar />
            <MobileNavbar
                isOpen={isOpen}
                toggleMenu={toggleMenu}
                closeMenu={closeMenu}
            />
        </nav>
    )
}