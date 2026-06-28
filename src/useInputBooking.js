import { useReducer } from 'react'

const initialState = {
    inputNama: "",
    inputNo: "",
    inputMobil: "",
    inputPlatNo: "",
    inputServis: "",
    inputJam: "",
    inputDate: "",
    inputEstimasi: "",
    inputWebsite: "", // <- HONEYPOT, field jebakan
}

const reduce = (state, action) => {
    if (action.type === "NAMA") {
        return { ...state, inputNama: action.payload };
    }
    if (action.type === "NO") {
        return { ...state, inputNo: action.payload };
    }
    if (action.type === "MOBIL") {
        return { ...state, inputMobil: action.payload };
    }
    if (action.type === "PLATNO") {
        return { ...state, inputPlatNo: action.payload };
    }
    if (action.type === "SERVIS") {
        return { ...state, inputServis: action.payload };
    }
    if (action.type === "JAM") {
        return { ...state, inputJam: action.payload };
    }
    if (action.type === "DATE") {
        return { ...state, inputDate: action.payload };
    }
    if (action.type === "ESTIMASI") {
        return { ...state, inputEstimasi: action.payload };
    }
    if (action.type === "WEBSITE") { // <- TAMBAH INI
        return { ...state, inputWebsite: action.payload };
    }
    if (action.type === "RESET") {
        return initialState;
    }
    return state;
}

function useInputBooking() {
    const [state, dispatch] = useReducer(reduce, initialState)
    return { state, dispatch }
}

export default useInputBooking
