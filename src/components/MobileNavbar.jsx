import { Link } from "react-router-dom";

export default function MobileNavbar({ isOpen, toggleMenu, closeMenu }) {
    const links = [
        { name: 'HOME', to: '/' },
        { name: 'DASHBOARD ADMIN', to: '/login' },
        { name: 'ANTRIAN', to: '/history' },
        { name: 'TRACK STATUS', to: '/track' },
        { name: 'BOOKING SERVICES', to: '/booking', isButton: true },
    ]

    return (
        <nav className="md:hidden bg-dark px-6 py-3 w-full relative">
            {/* Header Mobile: Logo + Hamburger */}
            <div className="flex justify-between items-center">
                <Link to="/" onClick={closeMenu}>
                    <h1 className="font-bold leading-tight">
                        <span className="text-text tracking-widest inline-block scale-y-180 font-neue text-base">
                            BENGKEL.IN
                        </span>
                        <br />
                        <span className="text-primary text-xs tracking-[0.3em] font-neue">
                            CARSERVICE
                        </span>
                    </h1>
                </Link>

                <button
                    onClick={toggleMenu}
                    className="p-2 text-text focus:outline-none relative z-50"
                    aria-label="Toggle menu"
                >
                    {/* Animated Hamburger to X */}
                    <div className="w-6 h-6 flex flex-col justify-center items-center">
                        <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'
                            }`} />
                        <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isOpen ? 'opacity-0' : 'opacity-100'
                            }`} />
                        <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'
                            }`} />
                    </div>
                </button>
            </div>

            {/* Overlay + Dropdown dengan animasi */}
            <div className={`
                fixed inset-0 bg-black/50 z-40 transition-opacity duration-300
                ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
            `}
                onClick={closeMenu}
            />

            <div className={`
                absolute top-full left-0 w-full bg-dark shadow-lg z-50 border-t border-gray-700
                transition-all duration-300 ease-out origin-top
                ${isOpen
                    ? 'opacity-100 scale-y-100 translate-y-0'
                    : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
                }
            `}>
                <ul className="flex flex-col p-4 gap-1">
                    {links.map((link, index) => (
                        <li
                            key={link.name}
                            className="transition-all duration-300"
                            style={{
                                transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                                opacity: isOpen ? 1 : 0,
                                transform: isOpen ? 'translateX(0)' : 'translateX(-10px)'
                            }}
                        >
                            <Link
                                to={link.to}
                                onClick={closeMenu}
                                className={`
                                    block py-3 px-4 rounded font-semibold text-sm
                                    ${link.isButton
                                        ? 'bg-primary text-dark text-center hover:bg-primary/90 active:scale-95'
                                        : 'text-text hover:text-primary hover:bg-gray-800 active:bg-gray-700'
                                    }
                                    transition-all duration-200
                                `}
                            >
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    )
}
