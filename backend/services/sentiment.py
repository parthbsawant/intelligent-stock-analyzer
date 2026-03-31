import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch.nn.functional as F

# ----------------------------------------
# 🔷 DEVICE (CROSS PLATFORM)
# ----------------------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ----------------------------------------
# 🔷 LOAD FINBERT MODEL
# ----------------------------------------
model_name = "ProsusAI/finbert"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

model.to(device)
model.eval()

labels = ["negative", "neutral", "positive"]


# ----------------------------------------
# 🔷 ANALYZE SINGLE TEXT
# ----------------------------------------
def analyze_text(text: str):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)

    probs = F.softmax(outputs.logits, dim=1)

    score, idx = torch.max(probs, dim=1)

    return labels[idx.item()], score.item()


# ----------------------------------------
# 🔷 ANALYZE MULTIPLE NEWS
# ----------------------------------------
def analyze_news_sentiment(news_list):
    results = []

    for article in news_list:
        title = article.get("title", "")
        if not title:
            continue

        sentiment, score = analyze_text(title)

        results.append({
            "title": title,
            "sentiment": sentiment,
            "score": round(score, 3)
        })

    return results


# ----------------------------------------
# 🔷 AGGREGATE FINAL SENTIMENT
# ----------------------------------------
def get_overall_sentiment(news_list):
    analyzed = analyze_news_sentiment(news_list)

    if not analyzed:
        return None

    score_map = {
        "positive": 1,
        "neutral": 0,
        "negative": -1
    }

    total = sum(score_map[a["sentiment"]] for a in analyzed)

    if total > 0:
        overall = "positive"
    elif total < 0:
        overall = "negative"
    else:
        overall = "neutral"

    return {
        "overall_sentiment": overall,
        "articles_analyzed": len(analyzed),
        "details": analyzed[:5]  # limit output
    }