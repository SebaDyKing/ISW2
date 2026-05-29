import api from "../../../config/api"

export const getAll  = () => api.get("/hojas-vida")
export const getById = (id) => api.get(`/hojas-vida/${id}`)
export const create  = (data) => api.post("/hojas-vida", data)
export const update  = (id, data) => api.patch(`/hojas-vida/${id}`, data)
export const remove  = (id) => api.delete(`/hojas-vida/${id}`)
