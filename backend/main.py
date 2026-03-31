from fastapi import FastAPI, Query
from typing import List
import pandas as pd

from services.data_fetch import (
    fetch_complete_data,
    fetch_stock_data,
    fetch_news
)

app = FastAPI(title="AI Market Intelligence API")


# ----------------------------------------
# 🔷 Utility: Normalize Symbol
# ----------------------------------------
def normalize_symbol(symbol: str) -> str:
    symbol = symbol.upper().strip()

    # Add .NS for Indian stocks if not present
    if symbol.isalpha() and not symbol.endswith(".NS"):
        return symbol + ".NS"

    return symbol


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

#     data = fetch_complete_data(symbol)

#     if not data["stock"]:
#         return {
#             "status": "error",
#             "message": "Stock data not found"
#         }

#     return {
#         "status": "success",
#         "symbol": symbol,
#         "data": data
#     }

@app.get("/analyze-stock")
def analyze_stock(symbol: str = Query(...)):
    symbol = normalize_symbol(symbol)

    data = fetch_complete_data(symbol)

    if not data["stock"]:
        return {
            "status": "error",
            "message": "Stock data not found"
        }

    # 🔥 Convert symbol to readable query
    company_map = {
        "RELIANCE": "Reliance Industries",
        "TCS": "Tata Consultancy Services",
        "INFY": "Infosys",
        "HDFCBANK": "HDFC Bank",
        "SBIN": "State Bank of India",
        "ADANI": "Adani Group"
    }

    base_symbol = symbol.replace(".NS", "")
    query = company_map.get(base_symbol, base_symbol)

    news = data.get("news", [])

    # 🔥 SENTIMENT INTEGRATION
    sentiment_result = get_overall_sentiment(news)

    return {
        "status": "success",
        "symbol": symbol,
        "data": {
            "stock": data.get("stock"),
            "news": news[:5],
            "sentiment": sentiment_result
        }
    }

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
# @app.get("/news")
# def get_news(symbol: str = Query(...)):
#     symbol = normalize_symbol(symbol)

#     news = fetch_news(symbol)

#     return {
#         "status": "success",
#         "symbol": symbol,
#         "articles": news
#     }
@app.get("/news")
def get_news(symbol: str = Query(...)):
    symbol = normalize_symbol(symbol)

    # 🔥 Convert symbol to readable query
    company_map = {
        "RELIANCE": "Reliance Industries",
        "TCS": "Tata Consultancy Services",
        "INFY": "Infosys",
        "HDFCBANK": "HDFC Bank",
        "SBIN": "State Bank of India",
        "ADANI": "Adani Group"
    }

    base_symbol = symbol.replace(".NS", "")
    query = company_map.get(base_symbol, base_symbol)

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

    stock = fetch_stock_data(symbol)

    if not stock:
        return {"status": "error", "message": "Stock data not found"}

    df = pd.DataFrame(stock["data"])

    if df.empty or len(df) < 5:
        return {"status": "error", "message": "Not enough data"}

    # Indicators
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

    return {
        "status": "success",
        "symbol": symbol,
        "RSI": round(latest["RSI"], 2) if pd.notna(latest["RSI"]) else None,
        "SMA": round(latest["SMA"], 2) if pd.notna(latest["SMA"]) else None,
        "EMA": round(latest["EMA"], 2) if pd.notna(latest["EMA"]) else None
    }


# ----------------------------------------
# 🔷 Sentiment API (TEMP LOGIC)
# ----------------------------------------
# @app.get("/sentiment")
# def sentiment(symbol: str = Query(...)):
#     symbol = normalize_symbol(symbol)

#     news = fetch_news(symbol)

#     if not news:
#         return {
#             "status": "error",
#             "message": "No news found"
#         }

#     # Placeholder sentiment logic
#     score = len(news) % 3
#     sentiment_label = ["negative", "neutral", "positive"][score]

#     return {
#         "status": "success",
#         "symbol": symbol,
#         "sentiment": sentiment_label,
#         "articles_analyzed": len(news)
#     }

# @app.get("/sentiment")
# def sentiment(symbol: str = Query(...)):
#     symbol = normalize_symbol(symbol)

#     company_map = {
#         "RELIANCE": "Reliance Industries",
#         "TCS": "Tata Consultancy Services",
#         "INFY": "Infosys",
#         "HDFCBANK": "HDFC Bank",
#         "SBIN": "State Bank of India",
#         "ADANI": "Adani Group"
#     }

#     base_symbol = symbol.replace(".NS", "")
#     query = company_map.get(base_symbol, base_symbol)

#     news = fetch_news(query)

#     if not news:
#         return {
#             "status": "error",
#             "message": "No news found"
#         }

#     # Placeholder sentiment logic
#     score = len(news) % 3
#     sentiment_label = ["negative", "neutral", "positive"][score]

#     return {
#         "status": "success",
#         "symbol": symbol,
#         "sentiment": sentiment_label,
#         "articles_analyzed": len(news)
#     }

from services.sentiment import get_overall_sentiment


@app.get("/sentiment")
def sentiment(symbol: str = Query(...)):
    symbol = normalize_symbol(symbol)

    company_map = {
        "RELIANCE": "Reliance Industries",
        "TCS": "Tata Consultancy Services",
        "INFY": "Infosys",
        "HDFCBANK": "HDFC Bank",
        "SBIN": "State Bank of India",
        "ADANI": "Adani Group"
    }

    base_symbol = symbol.replace(".NS", "")
    query = company_map.get(base_symbol, base_symbol)

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
# 🔷 Events API (TEMP NLP PLACEHOLDER)
# ----------------------------------------
# @app.get("/events")
# def events(symbol: str = Query(...)):
#     symbol = normalize_symbol(symbol)

#     news = fetch_news(symbol)

#     event_titles = [n["title"] for n in news if n.get("title")]

#     return {
#         "status": "success",
#         "symbol": symbol,
#         "events": event_titles
#     }

# @app.get("/events")
# def events(symbol: str = Query(...)):
#     symbol = normalize_symbol(symbol)

#     company_map = {
#         "RELIANCE": "Reliance Industries",
#         "TCS": "Tata Consultancy Services",
#         "INFY": "Infosys",
#         "HDFCBANK": "HDFC Bank",
#         "SBIN": "State Bank of India",
#         "ADANI": "Adani Group"
#     }

#     base_symbol = symbol.replace(".NS", "")
#     query = company_map.get(base_symbol, base_symbol)

#     news = fetch_news(query)

#     event_titles = [n["title"] for n in news if n.get("title")]

#     return {
#         "status": "success",
#         "symbol": symbol,
#         "events": event_titles
#     }

from services.nlp import process_news


@app.get("/events")
def events(symbol: str = Query(...)):
    symbol = normalize_symbol(symbol)

    company_map = {
        "RELIANCE": "Reliance Industries",
        "TCS": "Tata Consultancy Services",
        "INFY": "Infosys",
        "HDFCBANK": "HDFC Bank",
        "SBIN": "State Bank of India",
        "ADANI": "Adani Group"
    }

    base_symbol = symbol.replace(".NS", "")
    query = company_map.get(base_symbol, base_symbol)

    news = fetch_news(query)

    if not news:
        return {
            "status": "error",
            "message": "No news found"
        }

    processed_data = process_news(news, query)

    return {
        "status": "success",
        "symbol": symbol,
        "data": processed_data
    }

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

    stock = fetch_stock_data(symbol, period="1mo")

    if not stock:
        return {"status": "error", "message": "Stock data not found"}

    df = pd.DataFrame(stock["data"])

    if df.empty:
        return {"status": "error"}

    # Dummy backtest logic (trend-based)
    start_price = df["Close"].iloc[0]
    end_price = df["Close"].iloc[-1]

    profit = ((end_price - start_price) / start_price) * 100

    return {
        "status": "success",
        "symbol": symbol,
        "profit_percent": round(profit, 2),
        "data_points": len(df)
    }


# ----------------------------------------
# 🔷 Auth APIs (UNCHANGED)
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