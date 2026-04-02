# def final_decision(dl_pred, lstm_pred):
#     dl_signal = dl_pred["signal"]
#     lstm_signal = lstm_pred["signal"]

#     # Rule-based fusion (DL-inspired logic)
#     if dl_signal == lstm_signal:
#         return dl_signal

#     if dl_signal == "BUY" and lstm_signal == "HOLD":
#         return "HOLD"

#     if dl_signal == "SELL" and lstm_signal == "HOLD":
#         return "HOLD"

#     return "HOLD"

def signal_to_score(signal):
    if signal == "BUY":
        return 1
    elif signal == "SELL":
        return -1
    return 0


def final_decision(dl_pred, lstm_pred, sentiment_pred=None):
    """
    dl_pred: {"signal": "...", "confidence": ...}
    lstm_pred: {"signal": "...", "confidence": ...}
    sentiment_pred: optional
    """

    # Convert signals → numeric
    dl_score = signal_to_score(dl_pred["signal"])
    lstm_score = signal_to_score(lstm_pred["signal"])

    # Normalize confidence
    dl_weight = dl_pred.get("confidence", 0.5)
    lstm_weight = lstm_pred.get("confidence", 0.5)

    total_weight = dl_weight + lstm_weight

    if total_weight == 0:
        return {"signal": "HOLD"}

    # Weighted score
    final_score = (
        dl_score * dl_weight +
        lstm_score * lstm_weight
    ) / total_weight

    # Decision thresholds
    if final_score > 0.2:
        final_signal = "BUY"
    elif final_score < -0.2:
        final_signal = "SELL"
    else:
        final_signal = "HOLD"

    return {
        "signal": final_signal,
        "score": float(final_score),
        "weights": {
            "dl": dl_weight,
            "lstm": lstm_weight
        }
    }