# import spacy
# import torch
# from transformers import pipeline

# # ----------------------------------------
# # 🔷 DEVICE SELECTION (CROSS-PLATFORM)
# # ----------------------------------------
# device = 0 if torch.cuda.is_available() else -1

# # ----------------------------------------
# # 🔷 LOAD MODELS
# # ----------------------------------------
# nlp = spacy.load("en_core_web_trf")

# classifier = pipeline(
#     "zero-shot-classification",
#     model="facebook/bart-large-mnli",
#     device=device
# )

# # ----------------------------------------
# # 🔷 ENTITY EXTRACTION
# # ----------------------------------------
# def extract_entities(text: str):
#     doc = nlp(text)

#     entities = []

#     for ent in doc.ents:
#         if ent.label_ == "ORG" and len(ent.text) > 2:
#             entities.append(ent.text)

#     return list(set(entities))


# # ----------------------------------------
# # 🔷 NEGATION HANDLING
# # ----------------------------------------
# def is_negated(text: str, keyword: str):
#     negations = ["no", "not", "never", "denies", "denied", "without"]

#     for neg in negations:
#         if neg in text and keyword in text:
#             return True

#     return False


# # ----------------------------------------
# # 🔷 EVENT DETECTION (RULE + ML)
# # ----------------------------------------
# # def detect_events(text: str):
# #     text_lower = text.lower()

# #     patterns = {
# #     "merger_acquisition": [
# #         "acquisition", "acquire", "buyout", "takeover", "merger"
# #     ],
# #     "earnings": [
# #         "earnings", "results", "quarter", "revenue", "profit report"
# #     ],
# #     "expansion": [
# #         "expansion", "expand", "launch", "opening", "new plant", "growth", "investment"
# #     ],
# #     "loss": [
# #         "loss", "decline", "drop", "fall", "downturn"
# #     ],
# #     "profit": [
# #         "profit", "gain", "increase", "rise", "surge"
# #     ],
# #     "partnership": [
# #         "partnership", "collaboration", "tie-up", "agreement", "deal"
# #     ],
# #     "regulation": [
# #         "approval", "fda", "regulatory", "compliance", "filing", "accepted"
# #     ]
# # }
# #     detected_events = []

# #     # Rule-based detection
# #     for event, keywords in patterns.items():
# #         for kw in keywords:
# #             if kw in text_lower:
# #                 if not is_negated(text_lower, kw):
# #                     detected_events.append(event)
# #                     break
    
# #     # ML-based classification
# #     labels = list(patterns.keys())

# #     if not detected_events:
# #         try:
# #             result = classifier(text, labels)
# #             top_label = result["labels"][0]
# #             score = result["scores"][0]

# #             if score > 0.3:
# #                 detected_events.append(top_label)
# #         except:
# #             pass

# #     try:
# #         result = classifier(text, labels)
# #         top_label = result["labels"][0]
# #         score = result["scores"][0]

# #         # if score > 0.6:
# #         #     detected_events.append(top_label)
# #         if score > 0.4:
# #             detected_events.append(top_label)

# #     except Exception as e:
# #         print("Classifier error:", e)

# #     return list(set(detected_events))

# def detect_events(text: str):
#     text_lower = text.lower()

#     patterns = {
#         "merger_acquisition": [
#             "acquisition", "acquire", "buyout", "takeover", "merger"
#         ],
#         "earnings": [
#             "earnings", "results", "quarter", "revenue", "profit report"
#         ],
#         "expansion": [
#             "expansion", "expand", "launch", "opening", "new plant", "growth", "investment"
#         ],
#         "loss": [
#             "loss", "decline", "drop", "fall", "downturn"
#         ],
#         "profit": [
#             "profit", "gain", "increase", "rise", "surge"
#         ],
#         "partnership": [
#             "partnership", "collaboration", "tie-up", "agreement", "deal"
#         ],
#         "regulation": [
#             "approval", "fda", "regulatory", "compliance", "filing", "accepted"
#         ]
#     }

#     detected_events = []
#     labels = list(patterns.keys())

#     # -------------------------
#     # Rule-based detection
#     # -------------------------
#     for event, keywords in patterns.items():
#         for kw in keywords:
#             if kw in text_lower:
#                 if not is_negated(text_lower, kw):
#                     detected_events.append(event)
#                     break

#     # -------------------------
#     # ML-based detection (ONLY ONCE)
#     # -------------------------
#     try:
#         result = classifier(text, labels)
#         top_label = result["labels"][0]
#         score = result["scores"][0]

#         # If no rule match → rely on ML
#         if not detected_events and score > 0.3:
#             detected_events.append(top_label)

#         # If rule match exists → reinforce with ML
#         elif detected_events and score > 0.4:
#             detected_events.append(top_label)

#     except Exception as e:
#         print("Classifier error:", e)

#     return list(set(detected_events))

# # ----------------------------------------
# # 🔷 PROCESS ARTICLE
# # ----------------------------------------
# def process_article(article, query: str):
#     title = article.get("title", "") or ""
#     description = article.get("description", "") or ""

#     text = title + " " + description

#     # Relevance filtering
#     # if query.lower() not in text.lower():
#     #     return None
    
#     query_words = query.lower().split()

#     if not any(word in text.lower() for word in query_words):
#         if not extract_entities(text):
#             return None
    
#     entities = extract_entities(text)
#     events = detect_events(text)

#     return {
#         "title": title,
#         "entities": entities,
#         "events": events
#     }


# # ----------------------------------------
# # 🔷 PROCESS NEWS LIST
# # ----------------------------------------
# def process_news(news_list, query: str):
#     results = []

#     for article in news_list:
#         processed = process_article(article, query)

#         if processed:
#             results.append(processed)

#     return results



import spacy
import torch
from transformers import pipeline

# ----------------------------------------
# 🔷 DEVICE SELECTION (CROSS-PLATFORM)
# ----------------------------------------
device = 0 if torch.cuda.is_available() else -1

# ----------------------------------------
# 🔷 LOAD MODELS
# ----------------------------------------
nlp = spacy.load("en_core_web_trf")

classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli",
    device=device
)

# ----------------------------------------
# 🔷 ENTITY EXTRACTION (CLEANED)
# ----------------------------------------
def extract_entities(text: str):
    doc = nlp(text)

    entities = []

    for ent in doc.ents:
        if ent.label_ == "ORG" and len(ent.text) > 3:
            entities.append(ent.text.strip())

    return list(set(entities))


# ----------------------------------------
# 🔷 NEGATION HANDLING
# ----------------------------------------
def is_negated(text: str, keyword: str):
    negations = ["no", "not", "never", "denies", "denied", "without"]

    for neg in negations:
        if neg in text and keyword in text:
            return True

    return False


# ----------------------------------------
# 🔷 EVENT DETECTION (IMPROVED)
# ----------------------------------------
def detect_events(text: str):
    text_lower = text.lower()

    patterns = {
        "merger_acquisition": [
            "acquisition", "acquire", "buyout", "takeover", "merger"
        ],
        "earnings": [
            "earnings", "results", "quarter", "revenue"
        ],
        "expansion": [
            "expansion", "expand", "launch", "opening", "growth", "investment"
        ],
        "loss": [
            "loss", "decline", "drop", "fall"
        ],
        "profit": [
            "profit", "gain", "increase", "rise"
        ],
        "partnership": [
            "partnership", "collaboration", "tie-up", "agreement", "deal"
        ],
        "regulation": [
            "approval", "fda", "regulatory", "filing", "accepted"
        ]
    }

    detected_events = []
    labels = list(patterns.keys())

    # -------------------------
    # RULE-BASED DETECTION
    # -------------------------
    for event, keywords in patterns.items():
        for kw in keywords:
            if kw in text_lower:
                if not is_negated(text_lower, kw):
                    detected_events.append(event)
                    break

    # 🔥 STRONG SIGNAL OVERRIDE
    # Strong direct signals
    if "approval" in text_lower or "fda" in text_lower:
        return ["regulation"]

    # -------------------------
    # ML DETECTION (ONLY ONCE)
    # -------------------------
    try:
        result = classifier(text, labels)
        top_label = result["labels"][0]
        score = result["scores"][0]

        if not detected_events and score > 0.3:
            detected_events.append(top_label)

        elif detected_events and score > 0.4:
            detected_events.append(top_label)

    except Exception as e:
        print("Classifier error:", e)

    return list(set(detected_events))


# ----------------------------------------
# 🔷 PROCESS ARTICLE (STRICT FILTER)
# ----------------------------------------
# def process_article(article, query: str):
#     title = article.get("title", "") or ""
#     description = article.get("description", "") or ""

#     text = title + " " + description

#     entities = extract_entities(text)

#     # 🔥 STRICT COMPANY FILTER
#     query_words = query.lower().split()

# # Match if ANY important word matches entity OR text
#     if not any(
#         word in text.lower() or any(word in ent.lower() for ent in entities)
#         for word in query_words
# ):
#         return None

#     events = detect_events(text)

#     return {
#         "title": title,
#         "entities": entities,
#         "events": events
#     }

# def process_article(article, query: str):
#     title = article.get("title", "") or ""
#     description = article.get("description", "") or ""

#     text = (title + " " + description).lower()

#     entities = extract_entities(text)

#     query_words = query.lower().split()

#     # 🔥 STRONG FILTER (ENTITY + TEXT MATCH)
#     entity_match = any(
#         any(word in ent.lower() for word in query_words)
#         for ent in entities
#     )

#     text_match = any(word in text for word in query_words)

#     # Require at least ONE strong match
#     if not (entity_match or text_match):
#         return None

#     # ❗ Reject completely irrelevant (no entities at all)
#     if not entities:
#         return None

#     events = detect_events(text)

#     return {
#         "title": title,
#         "entities": entities,
#         "events": events
#     }

def process_article(article, query: str):
    title = article.get("title", "") or ""
    description = article.get("description", "") or ""

    text = (title + " " + description).lower()
    title_lower = title.lower()

    entities = extract_entities(text)

    query_words = query.lower().split()

    # 🔥 STRICT TITLE MATCH (MANDATORY)
    title_match = any(word in title_lower for word in query_words)

    # 🔥 STRICT ENTITY MATCH (STRONG FILTER)
    entity_match = any(
        any(word in ent.lower() for word in query_words)
        for ent in entities
    )

    # 🔥 FINAL STRICT CONDITION
    # Require TITLE match strongly (not just entity)
    if not title_match:
        return None

    # 🔥 EXTRA FILTER: remove generic news
    generic_words = ["market", "global", "industry", "economy"]

    if any(word in title_lower for word in generic_words) and not entity_match:
        return None

    events = detect_events(text)

    return {
        "title": title,
        "entities": entities,
        "events": events
    }

# ----------------------------------------
# 🔷 PROCESS NEWS LIST (DEDUPLICATION)
# ----------------------------------------
def process_news(news_list, query: str):
    results = []
    seen_titles = set()

    for article in news_list:
        title = article.get("title")

        if not title or title in seen_titles:
            continue

        seen_titles.add(title)

        processed = process_article(article, query)

        if processed:
            results.append(processed)

    return results