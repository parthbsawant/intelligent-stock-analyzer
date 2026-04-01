import numpy as np
import pandas as pd
import yfinance as yf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from sklearn.preprocessing import MinMaxScaler
import joblib

# ---------------------------
# 1. Fetch Data
# ---------------------------
def fetch_data(symbol="ADANIENT.NS"):
    df = yf.download(symbol, period="1y")
    return df["Close"].values.reshape(-1, 1)

# ---------------------------
# 2. Prepare Dataset
# ---------------------------
def prepare_data(data, seq_len=10):
    scaler = MinMaxScaler()
    data_scaled = scaler.fit_transform(data)

    X, y = [], []
    for i in range(seq_len, len(data_scaled)):
        X.append(data_scaled[i-seq_len:i])
        y.append(data_scaled[i])

    return np.array(X), np.array(y), scaler

# ---------------------------
# 3. Build Model
# ---------------------------
def build_model(input_shape):
    model = Sequential([
        LSTM(50, return_sequences=False, input_shape=input_shape),
        Dense(25, activation="relu"),
        Dense(1)
    ])
    model.compile(optimizer="adam", loss="mse")
    return model

# ---------------------------
# 4. Train
# ---------------------------
def train():
    data = fetch_data()
    X, y, scaler = prepare_data(data)

    model = build_model((X.shape[1], X.shape[2]))
    model.fit(X, y, epochs=10, batch_size=16)

    # Save model + scaler
    model.save("services/dl/lstm_model.h5")
    joblib.dump(scaler, "services/dl/scaler.pkl")

    print("✅ Training complete")

if __name__ == "__main__":
    train()