import api from './api'

export async function analyzeStock(symbol) {
  const response = await api.get('/analyze-stock', {
    params: { symbol },
  })

  return response.data
}

