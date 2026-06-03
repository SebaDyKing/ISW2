import { useState } from 'react'

export function useContratosTable(onSearch) {
  const [search, setSearch] = useState('')

  const handleSearch = (e) => {
    const value = e.target.value
    setSearch(value)
    onSearch?.(value)
  }

  return { search, handleSearch }
}
