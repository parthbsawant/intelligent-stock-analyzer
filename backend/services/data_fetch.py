import yfinance as yf
import requests
import pandas as pd
import os
from dotenv import load_dotenv
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from urllib.parse import quote

load_dotenv()

NEWS_API_KEY = os.getenv("NEWS_API_KEY")


# -----------------------------------
# STOCK DATA FETCH FUNCTION
# -----------------------------------
# def fetch_stock_data(symbol: str, period="5d", interval="1h"):
#     try:
#         stock = yf.Ticker(symbol)
#         df = stock.history(period=period, interval=interval)

#         if df.empty:
#             return None

#         df.reset_index(inplace=True)
#         df = df[["Datetime", "Open", "High", "Low", "Close", "Volume"]]
#         df["Datetime"] = df["Datetime"].astype(str)

#         return {
#             "symbol": symbol,
#             "data": df.to_dict(orient="records")
#         }

#     except Exception as e:
#         print("Stock Fetch Error:", e)
#         return None
def fetch_stock_data(symbol, period="5d"):
    try:
        import yfinance as yf
        import pandas as pd

        stock = yf.Ticker(symbol)

        # 🔥 SAFE CALL
        # df = stock.history(period=period)
        df = stock.history(period=period, timeout=5)

        # 🔥 HARD CHECKS (VERY IMPORTANT)
        if df is None:
            print(f"[ERROR] No dataframe returned for {symbol}")
            return None

        if not isinstance(df, pd.DataFrame):
            print(f"[ERROR] Invalid dataframe type for {symbol}")
            return None

        if df.empty:
            print(f"[ERROR] Empty dataframe for {symbol}")
            return None

        df = df.reset_index()

        return {
            "symbol": symbol,
            "data": df.to_dict(orient="records")
        }

    except Exception as e:
        print(f"[YFINANCE SAFE ERROR] {symbol}: {str(e)}")
        return None
# -----------------------------------
# 🔥 GOOGLE NEWS RSS (MOST IMPORTANT)
# -----------------------------------
def fetch_google_news(query: str):
    try:
        query_encoded = quote(query + " stock")
        url = f"https://news.google.com/rss/search?q={query_encoded}&hl=en-IN&gl=IN&ceid=IN:en"

        response = requests.get(url)
        root = ET.fromstring(response.content)

        articles = []

        for item in root.findall(".//item"):
            articles.append({
                "title": item.find("title").text if item.find("title") is not None else "",
                "description": "",
                "source": "Google News",
                "published_at": item.find("pubDate").text if item.find("pubDate") is not None else "",
                "url": item.find("link").text if item.find("link") is not None else ""
            })

        return articles[:10]

    except Exception as e:
        print("Google RSS Error:", e)
        return []


# -----------------------------------
# 🔥 YAHOO RSS
# -----------------------------------
def fetch_yahoo_news(symbol: str):
    try:
        url = f"https://feeds.finance.yahoo.com/rss/2.0/headline?s={symbol}&region=US&lang=en-US"

        response = requests.get(url)
        root = ET.fromstring(response.content)

        articles = []

        for item in root.findall(".//item"):
            articles.append({
                "title": item.find("title").text if item.find("title") is not None else "",
                "description": "",
                "source": "Yahoo Finance",
                "published_at": item.find("pubDate").text if item.find("pubDate") is not None else "",
                "url": item.find("link").text if item.find("link") is not None else ""
            })

        return articles

    except Exception as e:
        print("Yahoo Error:", e)
        return []


# -----------------------------------
# 🔥 MONEYCONTROL
# -----------------------------------
def fetch_moneycontrol_news(query: str):
    try:
        url = f"https://www.moneycontrol.com/news/tags/{query}.html"
        headers = {"User-Agent": "Mozilla/5.0"}

        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, "html.parser")

        articles = []

        for item in soup.find_all("li", class_="clearfix"):
            title_tag = item.find("h2")
            link_tag = item.find("a")

            if not title_tag or not link_tag:
                continue

            articles.append({
                "title": title_tag.get_text(strip=True),
                "description": "",
                "source": "Moneycontrol",
                "url": link_tag.get("href")
            })

        return articles[:10]

    except Exception as e:
        print("Moneycontrol Error:", e)
        return []


# -----------------------------------
# 🔥 ECONOMIC TIMES
# -----------------------------------
def fetch_et_news(query: str):
    try:
        url = f"https://economictimes.indiatimes.com/topic/{query}"
        headers = {"User-Agent": "Mozilla/5.0"}

        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, "html.parser")

        articles = []

        for item in soup.find_all("div", class_="eachStory"):
            title_tag = item.find("h3")
            link_tag = item.find("a")

            if not title_tag or not link_tag:
                continue

            articles.append({
                "title": title_tag.get_text(strip=True),
                "description": "",
                "source": "Economic Times",
                "url": "https://economictimes.indiatimes.com" + link_tag.get("href")
            })

        return articles[:10]

    except Exception as e:
        print("ET Error:", e)
        return []


# -----------------------------------
# 🔥 BUSINESS STANDARD
# -----------------------------------
def fetch_business_standard(query: str):
    try:
        url = f"https://www.business-standard.com/search?q={query}"
        headers = {"User-Agent": "Mozilla/5.0"}

        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, "html.parser")

        articles = []

        for item in soup.find_all("p", class_="type_"):
            link_tag = item.find("a")

            if not link_tag:
                continue

            articles.append({
                "title": link_tag.get_text(strip=True),
                "description": "",
                "source": "Business Standard",
                "url": "https://www.business-standard.com" + link_tag.get("href")
            })

        return articles[:10]

    except Exception as e:
        print("Business Standard Error:", e)
        return []


# -----------------------------------
# 🔥 NEWS API (FINAL FALLBACK)
# -----------------------------------
def fetch_newsapi(query: str):
    try:
        url = "https://newsapi.org/v2/everything"

        params = {
            "q": query,
            "language": "en",
            "sortBy": "publishedAt",
            "pageSize": 10,
            "apiKey": NEWS_API_KEY
        }

        response = requests.get(url, params=params)
        data = response.json()

        articles = []

        for article in data.get("articles", []):
            articles.append({
                "title": article.get("title"),
                "description": article.get("description"),
                "source": article.get("source", {}).get("name"),
                "published_at": article.get("publishedAt"),
                "url": article.get("url")
            })

        return articles

    except Exception as e:
        print("NewsAPI Error:", e)
        return []


# -----------------------------------
# 🔥 RELEVANCE SCORING
# -----------------------------------
def score_article(article, query):
    title = article.get("title", "").lower()
    score = 0

    if query.lower() in title:
        score += 3

    if "stock" in title:
        score += 2

    if "market" in title:
        score -= 1

    return score


# -----------------------------------
# 🔥 COMBINED NEWS ENGINE
# -----------------------------------
def fetch_news(query: str):
    try:
        all_news = []

        # 🔥 MULTI SOURCE
        all_news.extend(fetch_google_news(query))
        all_news.extend(fetch_yahoo_news(query))
        all_news.extend(fetch_moneycontrol_news(query))
        all_news.extend(fetch_et_news(query))
        all_news.extend(fetch_business_standard(query))

        # fallback
        if not all_news:
            all_news.extend(fetch_newsapi(query))

        # 🔥 DEDUPLICATION
        seen = set()
        unique_news = []

        for article in all_news:
            title = article.get("title")

            if not title or title in seen:
                continue

            seen.add(title)
            unique_news.append(article)

        # 🔥 SCORING + SORTING
        unique_news.sort(key=lambda x: score_article(x, query), reverse=True)

        return unique_news[:15]

    except Exception as e:
        print("Combined News Error:", e)
        return []


# -----------------------------------
# COMBINED FETCH FUNCTION
# -----------------------------------
def fetch_complete_data(symbol):
    try:
        stock_data = fetch_stock_data(symbol)

        return {
            "stock": stock_data
        }

    except Exception as e:
        print(f"[FETCH COMPLETE ERROR] {symbol} -> {str(e)}")
        return {
            "stock": None
        }