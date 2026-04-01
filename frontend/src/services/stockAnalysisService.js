import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

// 🔥 Analyze Stock
export const analyzeStock = async (symbol) => {
  try {
    const response = await axios.get(`${API_BASE}/analyze-stock`, {
      params: { symbol },
    });
    return response.data;
  } catch (error) {
    console.error("Analyze API Error:", error);
    throw error;
  }
};

// 🔥 Get Events
export const getEvents = async (symbol) => {
  try {
    const response = await axios.get(`${API_BASE}/events`, {
      params: { symbol },
    });
    return response.data;
  } catch (error) {
    console.error("Events API Error:", error);
    throw error;
  }
};


export const getTechnicals = async (symbol) => {
  try {
    const response = await axios.get(`${API_BASE}/technical-analysis`, {
      params: { symbol },
    });
    return response.data;
  } catch (error) {
    console.error("Technical API Error:", error);
    throw error;
  }
};