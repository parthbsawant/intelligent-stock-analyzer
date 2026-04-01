import numpy as np

# 🔥 Simulated Dense Layer (Neural Scoring)
def dense_layer(x):
    # Random weights (simulating trained network)
    weights = np.random.rand(x.shape[1], 3)
    bias = np.random.rand(3)

    output = np.dot(x, weights) + bias
    return output


# 🔥 Softmax (DL activation)
def softmax(x):
    exp_x = np.exp(x - np.max(x))
    return exp_x / exp_x.sum(axis=1, keepdims=True)


# 🔥 Final DL Prediction
def dl_predict(embeddings):
    if len(embeddings) == 0:
        return {
            "signal": "HOLD",
            "confidence": 0.5
        }

    # Pass through dense layer
    logits = dense_layer(embeddings)

    # Convert to probabilities
    probs = softmax(logits)

    # Average across news articles
    avg_probs = np.mean(probs, axis=0)

    classes = ["SELL", "HOLD", "BUY"]

    idx = np.argmax(avg_probs)

    return {
        "signal": classes[idx],
        "confidence": float(avg_probs[idx])
    }