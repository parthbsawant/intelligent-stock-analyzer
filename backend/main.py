from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Query
from typing import List
import pandas as pd
from services.dl.sentiment_embedding import get_embeddings
from services.dl.prediction_dl import dl_predict
from services.dl.lstm_model import lstm_predict

from services.dl.fusion import final_decision


# ----------------------------------------
# 🔷 ALL SERVICE IMPORTS AT TOP
# ----------------------------------------
from services.data_fetch import (
    fetch_complete_data,
    fetch_stock_data,
    fetch_news
)
from services.sentiment import get_overall_sentiment
from services.nlp import process_news

app = FastAPI(title="AI Market Intelligence API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------
# 🔷 Shared Maps
# ----------------------------------------

# Human-readable company name (for news search queries)
COMPANY_MAP = {
    "RELIANCE": "Reliance Industries",
    "TCS": "Tata Consultancy Services",
    "INFY": "Infosys",
    "HDFCBANK": "HDFC Bank",
    "SBIN": "State Bank of India",
    "ADANI": "Adani Group",
    "WIPRO": "Wipro",
    "ICICIBANK": "ICICI Bank",
    "BAJFINANCE": "Bajaj Finance",
    "TATAMOTORS": "Tata Motors",
}

# Correct yfinance NSE tickers (group names -> actual listed ticker)
TICKER_MAP = {
    "ADANI": "ADANIENT.NS",        # Adani Enterprises (flagship listed stock)
    "RELIANCE": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "INFY": "INFY.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "SBIN": "SBIN.NS",
    "WIPRO": "WIPRO.NS",
    "ICICIBANK": "ICICIBANK.NS",
    "BAJFINANCE": "BAJFINANCE.NS",
    "TATAMOTORS": "TATAMOTORS.NS",
}

# ----------------------------------------
# 🔷 Utility Functions
# ----------------------------------------

def normalize_symbol(symbol: str) -> str:
    """Uppercase + add .NS suffix for Indian stocks"""
    symbol = symbol.upper().strip()
    if symbol.isalpha() and not symbol.endswith(".NS"):
        return symbol + ".NS"
    return symbol

def get_query(symbol: str) -> str:
    """Get human-readable company name for news search"""
    base = symbol.replace(".NS", "")
    return COMPANY_MAP.get(base, base)

def get_ticker(symbol: str) -> str:
    """Get correct yfinance ticker (handles group names like ADANI -> ADANIENT.NS)"""
    base = symbol.replace(".NS", "")
    return TICKER_MAP.get(base, symbol)  # fallback to original symbol if not in map


# ----------------------------------------
# 🔷 Health Check
# ----------------------------------------
@app.get("/")
def home():
    return {"message": "Backend is running"}


# ----------------------------------------
# 🔷 Core Analysis API
# ----------------------------------------
# @app.get("/analyze-stock")
# def analyze_stock(symbol: str = Query(...)):
#     symbol = normalize_symbol(symbol)
#     ticker = get_ticker(symbol)
#     query = get_query(symbol)

#     data = fetch_complete_data(ticker)

#     if not data or not data.get("stock"):
#         return {
#             "status": "error",
#             "message": f"Stock data unavailable for {ticker}"
#         }

#     # Fetch news using company name for better results
#     # news = fetch_news(query)[:5]
#     # sentiment_result = get_overall_sentiment(news)

#     news = fetch_news(query)[:2]
#     sentiment_result = get_overall_sentiment(news[:2])

#     return {
#         "status": "success",
#         "symbol": symbol,
#         "ticker": ticker,
#         "data": {
#             "stock": stock_data,
#             "news": news[:5],
#             "sentiment": sentiment_result
#         }
#     }

@app.get("/analyze-stock")
def analyze_stock(symbol: str = Query(...)):
    try:
        symbol = normalize_symbol(symbol)
        ticker = get_ticker(symbol)
        query = get_query(symbol)

        stock_data = fetch_stock_data(ticker)
        lstm_result = lstm_predict(stock_data)

        if not stock_data:
            return {"status": "error", "message": "Stock data unavailable"}

        news = fetch_news(query)[:2]
        # 🔥 DL EMBEDDINGS (SAFE LIMIT)
        texts = [article["title"] for article in news[:2]]

        try:
            embeddings = get_embeddings(texts)
            embedding_shape = embeddings.shape if len(embeddings) > 0 else (0,)
        except Exception as e:
            print("[EMBEDDING ERROR]", e)
            embeddings = []
            embedding_shape = (0,)
        
        prediction = dl_predict(embeddings)
        sentiment_result = get_overall_sentiment(news[:2])


        final_signal = final_decision(prediction, lstm_result)

        return {
            "status": "success",
            "symbol": symbol,
            "ticker": ticker,
            "data": {
                "stock": stock_data,
                "news": news,
                "sentiment": sentiment_result
            },
            "dl_features": {
                "embedding_shape": embedding_shape
            },
            "dl_prediction": prediction,
            "lstm_prediction": lstm_result,
            "final_prediction": final_signal
        }

    except Exception as e:
        print("[CRASH SAFE]", e)
        return {"status": "error", "message": "Internal error"}



# ----------------------------------------
# 🔷 Market Overview
# ----------------------------------------
@app.get("/market-overview")
def market_overview():
    symbols = ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS"]
    overview = []

    for sym in symbols:
        stock = fetch_stock_data(sym)
        if stock and stock["data"]:
            latest = stock["data"][-1]
            overview.append({
                "symbol": sym,
                "price": latest.get("Close"),
                "volume": latest.get("Volume")
            })

    return {
        "status": "success",
        "data": overview
    }


# ----------------------------------------
# 🔷 News API
# ----------------------------------------
@app.get("/news")
def get_news(symbol: str = Query(...)):
    symbol = normalize_symbol(symbol)
    query = get_query(symbol)
    news = fetch_news(query)

    return {
        "status": "success",
        "symbol": symbol,
        "articles": news
    }


# ----------------------------------------
# 🔷 Technical Analysis
# ----------------------------------------
@app.get("/technical-analysis")
def technical_analysis(symbol: str = Query(...)):
    symbol = normalize_symbol(symbol)
    ticker = get_ticker(symbol)    # 🔥 ADANI -> ADANIENT.NS etc.

    stock = fetch_stock_data(ticker)

    if not stock:
        return {"status": "error", "message": f"Stock data not found for {ticker}"}

    df = pd.DataFrame(stock["data"])

    if df.empty or len(df) < 5:
        return {"status": "error", "message": "Not enough data for indicators"}

    # --- Indicators ---
    df["SMA"] = df["Close"].rolling(window=5).mean()
    df["EMA"] = df["Close"].ewm(span=5).mean()

    delta = df["Close"].diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.rolling(window=5).mean()
    avg_loss = loss.rolling(window=5).mean()
    rs = avg_gain / avg_loss
    df["RSI"] = 100 - (100 / (1 + rs))

    latest = df.iloc[-1]

    rsi_value = round(latest["RSI"], 2) if pd.notna(latest["RSI"]) else None

    # RSI signal interpretation
    if rsi_value is not None:
        if rsi_value > 70:
            rsi_signal = "Overbought"
        elif rsi_value < 30:
            rsi_signal = "Oversold"
        else:
            rsi_signal = "Neutral"
    else:
        rsi_signal = "N/A"

    return {
        "status": "success",
        "symbol": symbol,
        "ticker": ticker,
        "RSI": rsi_value,
        "RSI_signal": rsi_signal,
        "SMA": round(latest["SMA"], 2) if pd.notna(latest["SMA"]) else None,
        "EMA": round(latest["EMA"], 2) if pd.notna(latest["EMA"]) else None,
    }


# ----------------------------------------
# 🔷 Sentiment API
# ----------------------------------------
@app.get("/sentiment")
def sentiment(symbol: str = Query(...)):
    symbol = normalize_symbol(symbol)
    query = get_query(symbol)
    news = fetch_news(query)

    if not news:
        return {
            "status": "error",
            "message": "No news found"
        }

    sentiment_result = get_overall_sentiment(news)

    return {
        "status": "success",
        "symbol": symbol,
        "data": sentiment_result
    }


# ----------------------------------------
# 🔷 Events API
# ----------------------------------------
# @app.get("/events")
# def events(symbol: str = Query(...)):
#     symbol = normalize_symbol(symbol)
#     query = get_query(symbol)

#     news = fetch_news(query)[:5]

#     if not news:
#         return {"status": "error", "message": "No news found"}

#     # Step 1: NLP event extraction
#     try:
#         processed_data = process_news(news, query)
#     except Exception as e:
#         print(f"[NLP ERROR] process_news failed: {e}")
#         return {"status": "error", "message": f"NLP processing failed: {str(e)}"}

#     # Step 2: Sentiment on same news list — index-based mapping
#     try:
#         sentiment_result = get_overall_sentiment(news)
#         sentiment_details = sentiment_result.get("details", [])

#         for i, item in enumerate(processed_data):
#             if i < len(sentiment_details):
#                 item["sentiment"] = sentiment_details[i].get("sentiment", "neutral")
#                 item["score"] = sentiment_details[i].get("score", 0.0)
#             else:
#                 item["sentiment"] = "neutral"
#                 item["score"] = 0.0

#     except Exception as e:
#         print(f"[SENTIMENT ERROR] enrichment failed: {e}")
#         for item in processed_data:
#             item.setdefault("sentiment", "neutral")
#             item.setdefault("score", 0.0)

#     return {
#         "status": "success",
#         "symbol": symbol,
#         "data": processed_data
#     }


# ----------------------------------------
# 🔷 Portfolio APIs
# ----------------------------------------
portfolio_store = []

@app.get("/portfolio")
def get_portfolio():
    return {
        "status": "success",
        "stocks": portfolio_store
    }

@app.post("/portfolio")
def add_portfolio(stocks: List[str]):
    global portfolio_store
    portfolio_store = [normalize_symbol(s) for s in stocks]
    return {
        "status": "success",
        "message": "Portfolio updated",
        "stocks": portfolio_store
    }

@app.delete("/portfolio")
def delete_portfolio():
    global portfolio_store
    portfolio_store = []
    return {
        "status": "success",
        "message": "Portfolio cleared"
    }


# ----------------------------------------
# 🔷 Backtesting API
# ----------------------------------------
@app.get("/backtest")
def backtest(symbol: str = Query(...)):
    symbol = normalize_symbol(symbol)
    ticker = get_ticker(symbol)    # 🔥 use correct yfinance ticker

    stock = fetch_stock_data(ticker, period="1mo")

    if not stock:
        return {"status": "error", "message": f"Stock data not found for {ticker}"}

    df = pd.DataFrame(stock["data"])

    if df.empty:
        return {"status": "error", "message": "No data returned"}

    start_price = df["Close"].iloc[0]
    end_price = df["Close"].iloc[-1]
    profit = ((end_price - start_price) / start_price) * 100

    return {
        "status": "success",
        "symbol": symbol,
        "ticker": ticker,
        "profit_percent": round(profit, 2),
        "data_points": len(df)
    }


# ----------------------------------------
# 🔷 Auth APIs
# ----------------------------------------
@app.post("/login")
def login():
    return {"token": "dummy-token"}

@app.post("/signup")
def signup():
    return {"message": "User created", "token": "dummy-token"}

@app.get("/profile")
def profile():
    return {
        "username": "test_user",
        "email": "user@example.com"
    }