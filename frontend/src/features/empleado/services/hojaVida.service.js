import api from "../../../config/axios"

export const getAll = () => api.get("/hojas-vida")
