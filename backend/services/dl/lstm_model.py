import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense


# 🔥 Build LSTM model (once)
def build_lstm_model(input_shape):
    model = Sequential([
        LSTM(32, return_sequences=True, input_shape=input_shape),
        LSTM(32),
        Dense(16, activation='relu'),
        Dense(1, activation='sigmoid')  # probability of upward movement
    ])

    return model


# 🔥 Prepare data for LSTM
def prepare_sequence(stock_data):
    if not stock_data or "data" not in stock_data:
        return None

    prices = []

    for item in stock_data["data"][-10:]:  # last 10 days
        prices.append([
            item["Open"],
            item["High"],
            item["Low"],
            item["Close"],
            item["Volume"]
        ])

    if len(prices) < 5:
        return None

    return np.array(prices).reshape(1, len(prices), 5)


# 🔥 LSTM prediction (inference)
def lstm_predict(stock_data):
    sequence = prepare_sequence(stock_data)

    if sequence is None:
        return {
            "signal": "HOLD",
            "confidence": 0.5
        }

    model = build_lstm_model((sequence.shape[1], sequence.shape[2]))

    prediction = model.predict(sequence, verbose=0)[0][0]

    if prediction > 0.6:
        signal = "BUY"
    elif prediction < 0.4:
        signal = "SELL"
    else:
        signal = "HOLD"

    return {
        "signal": signal,
        "confidence": float(prediction)
    }