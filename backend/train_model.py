import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import os

print("Starting TokenPay ML Security Model Training Pipeline...")

np.random.seed(42)

# Generate Synthetic Data for 10,000 Transactions
# Features: [amount (INR), is_vpn_proxy (0 or 1), device_age_days, recent_failed_attempts]
num_samples = 10000

print(f"Generating synthetic dataset of {num_samples} transaction vectors...")

# Normal transactions
amounts_normal = np.random.exponential(scale=500, size=8000)
vpn_normal = np.random.choice([0, 1], size=8000, p=[0.95, 0.05])
device_age_normal = np.random.randint(30, 365, size=8000)
failed_normal = np.random.choice([0, 1, 2], size=8000, p=[0.9, 0.08, 0.02])

# Malicious transactions (Anomalous vectors)
amounts_fraud = np.random.exponential(scale=5000, size=2000)
vpn_fraud = np.random.choice([0, 1], size=2000, p=[0.3, 0.7])  # Much higher chance of VPN
device_age_fraud = np.random.randint(0, 5, size=2000)          # Brand new devices (burning accounts)
failed_fraud = np.random.randint(1, 10, size=2000)            # Velocity attacks

# Combine and shape
X_normal = np.column_stack((amounts_normal, vpn_normal, device_age_normal, failed_normal))
X_fraud = np.column_stack((amounts_fraud, vpn_fraud, device_age_fraud, failed_fraud))
y_normal = np.zeros(8000) # 0 = Safe
y_fraud = np.ones(2000)   # 1 = Fraud

X = np.vstack((X_normal, X_fraud))
y = np.concatenate((y_normal, y_fraud))

# Split the dataset
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Matrix assembly complete. Training Scikit-Learn Model (Simulating XGBoost architecture)...")

# We use RandomForest to simulate a high-performance tree architecture as dictated in the PRD/Blueprints
model = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Training Complete! Accuracy: {accuracy * 100:.2f}%")
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# Save the model artifact
model_path = os.path.join(os.path.dirname(__file__), "app", "fraud_model.pkl")
joblib.dump(model, model_path)

print(f"Model Artifact saved successfully to: {model_path}")
print("TokenPay AI Core is ready for integration.")
