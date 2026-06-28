import { Link } from "react-router-dom";

function DesktopNavbar() {
    return (
        <nav className="hidden md:block bg-dark px-6 lg:px-10 py-3 w-full">
            <div className="max-w-7xl mx-auto flex justify-between items-center font-semibold">
                {/* Logo */}
                <Link to="/">
                    <h1 className="font-bold leading-tight">
                        <span className="text-text tracking-widest inline-block scale-y-180 font-neue text-base lg:text-lg">
                            CAKARABANGKIT
                        </span>
                        <br />
                        <span className="text-primary text-xs lg:text-sm tracking-[0.3em] font-neue">
                            CARSERVICE
                        </span>
                    </h1>
                </Link>

                {/* Menu Desktop */}
                <div className="flex items-center gap-4 lg:gap-6 text-white text-xs lg:text-sm">
                    <Link
                        to="/"
                        className="text-primary hover:scale-110 transition-transform duration-300"
                    >
                        HOME
                    </Link>

                    <Link
                        to="/login"
                        className="text-text hover:text-primary hover:scale-110 transition-transform duration-300"
                    >
                        DASHBOARD ADMIN
                    </Link>

                    <Link
                        to="/history"
                        className="text-text hover:text-primary hover:scale-110 transition-transform duration-300"
                    >
                        ANTRIAN
                    </Link>

                    <Link
                        to="/track"
                        className="text-text hover:text-primary hover:scale-110 transition-transform duration-300"
                    >
                        TRACK STATUS
                    </Link>

                    <Link
                        to="/booking"
                        className="bg-primary text-text px-4 py-2 rounded-md hover:bg-primary/90 hover:scale-105 transition-all duration-300"
                    >
                        BOOKING SERVICES
                    </Link>
                </div>
            </div>
        </nav>
    )
}

export default DesktopNavbar
