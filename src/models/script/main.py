import sys
import json
import numpy as np
import joblib
from preprocessing_pipeline import PreprocessingPipeline  
import os
import traceback

# Debug: Print info
print("=" * 60, file=sys.stderr)
print("SCRIPT DEBUG INFO", file=sys.stderr)
print("=" * 60, file=sys.stderr)
print(f"Script file: {os.path.abspath(__file__)}", file=sys.stderr)
print(f"Working dir: {os.getcwd()}", file=sys.stderr)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
print(f"BASE_DIR: {BASE_DIR}", file=sys.stderr)

# Debug: Check what's in BASE_DIR parent
parent_dir = os.path.dirname(BASE_DIR)
print(f"Parent dir: {parent_dir}", file=sys.stderr)
if os.path.exists(parent_dir):
    print(f"Contents: {os.listdir(parent_dir)}", file=sys.stderr)

PIPELINE_PATH = os.path.join(BASE_DIR, '../model/preprocessing_pipeline.pkl')
SCALER_PATH = os.path.join(BASE_DIR, '../model/scaler.pkl')
RUL_MODEL_PATH = os.path.join(BASE_DIR, '../model/rul_model.pkl')
FAILURE_MODEL_PATH = os.path.join(BASE_DIR, '../model/failure_model.pkl')
LABEL_ENCODER_PATH = os.path.join(BASE_DIR, '../model/label_encoder.pkl')

# Debug: Print all paths
print("\nModel paths:", file=sys.stderr)
print(f"PIPELINE: {PIPELINE_PATH}", file=sys.stderr)
print(f"SCALER: {SCALER_PATH}", file=sys.stderr)
print(f"RUL_MODEL: {RUL_MODEL_PATH}", file=sys.stderr)
print(f"FAILURE: {FAILURE_MODEL_PATH}", file=sys.stderr)
print(f"LABEL_ENCODER: {LABEL_ENCODER_PATH}", file=sys.stderr)

# Debug: Check if model directory exists
model_dir = os.path.join(BASE_DIR, '../model')
print(f"\nModel dir: {model_dir}", file=sys.stderr)
print(f"Exists: {os.path.exists(model_dir)}", file=sys.stderr)
if os.path.exists(model_dir):
    print(f"Contents: {os.listdir(model_dir)}", file=sys.stderr)
else:
    # Search for .pkl files
    print("Searching for .pkl files...", file=sys.stderr)
    for root, dirs, files in os.walk(BASE_DIR):
        for file in files:
            if file.endswith('.pkl'):
                print(f"  Found: {os.path.join(root, file)}", file=sys.stderr)

print("=" * 60, file=sys.stderr)


# --------------------------------------
# 1. Load all models once
# --------------------------------------
def load_models():
    models = {}
    try:
        # Check each file before loading
        print("\nChecking files before loading:", file=sys.stderr)
        for name, path in [
            ('PIPELINE', PIPELINE_PATH),
            ('SCALER', SCALER_PATH),
            ('RUL_MODEL', RUL_MODEL_PATH),
            ('FAILURE', FAILURE_MODEL_PATH),
            ('LABEL_ENCODER', LABEL_ENCODER_PATH)
        ]:
            exists = os.path.exists(path)
            if exists:
                size = os.path.getsize(path)
                print(f"  ✓ {name}: {size:,} bytes", file=sys.stderr)
            else:
                print(f"  ✗ {name}: NOT FOUND at {path}", file=sys.stderr)
        
        print("\nLoading preprocessing pipeline...", file=sys.stderr)
        models['pipeline'] = PreprocessingPipeline.load(PIPELINE_PATH)
        print("Pipeline loaded", file=sys.stderr)

        print("Loading scaler...", file=sys.stderr)
        models['scaler'] = joblib.load(SCALER_PATH)
        print("Scaler loaded", file=sys.stderr)

        print("Loading RUL model...", file=sys.stderr)
        models['rul_model'] = joblib.load(RUL_MODEL_PATH)
        print("RUL model loaded", file=sys.stderr)

        print("Loading failure classifier...", file=sys.stderr)
        models['failure_model'] = joblib.load(FAILURE_MODEL_PATH)
        print("Failure classifier loaded", file=sys.stderr)

        print("Loading label encoder...", file=sys.stderr)
        models['label_encoder'] = joblib.load(LABEL_ENCODER_PATH)
        print("Label encoder loaded", file=sys.stderr)

        return models

    except Exception as e:
        print(f"\nERROR loading models: {str(e)}", file=sys.stderr)
        print(f"Error type: {type(e).__name__}", file=sys.stderr)
        print(f"\nFull traceback:\n{traceback.format_exc()}", file=sys.stderr)
        sys.exit(1)


# --------------------------------------
# 2. Predict function (single)
# --------------------------------------
def predict_single(models, sensor_data):
    try:
        is_valid, error_msg = models['pipeline'].validate_input(sensor_data)
        if not is_valid:
            return {"status": "error", "error": error_msg}

        features = models['pipeline'].transform_single(sensor_data)
        features_scaled = models['scaler'].transform(features)

        rul_hours = float(models['rul_model'].predict(features_scaled)[0])
        rul_days = rul_hours / 24

        failure_type = None
        failure_confidence = None
        failure_probabilities = None

        if rul_days < 60:
            failure_idx = models['failure_model'].predict(features_scaled)[0]
            failure_proba = models['failure_model'].predict_proba(features_scaled)[0]
            failure_type = models['label_encoder'].inverse_transform([failure_idx])[0]
            failure_confidence = float(failure_proba[failure_idx])
            failure_probabilities = {
                cls: float(prob) 
                for cls, prob in zip(models['label_encoder'].classes_, failure_proba)
            }

        if rul_days < 7:
            status = "CRITICAL"
            priority = "URGENT"
            action = "Schedule maintenance IMMEDIATELY (within 1-2 days)"
        elif rul_days < 30:
            status = "CRITICAL"
            priority = "HIGH"
            action = "Schedule maintenance within 1-2 weeks"
        elif rul_days < 60:
            status = "WARNING"
            priority = "MEDIUM"
            action = "Schedule maintenance within 4-8 weeks"
        else:
            status = "NORMAL"
            priority = "LOW"
            action = "Continue routine monitoring"

        return {
            "status": "success",
            "prediction": {
                "rul_hours": round(rul_hours, 1),
                "rul_days": round(rul_days, 1),
                "status": status,
                "priority": priority,
                "action": action
            },
            "failure": {
                "type": failure_type,
                "confidence": round(failure_confidence, 3) if failure_confidence else None,
                "probabilities": {
                    k: round(v, 3) for k, v in failure_probabilities.items()
                } if failure_probabilities else None
            },
            "sensor_summary": {
                "air_temp": sensor_data.get('Air_temperature'),
                "process_temp": sensor_data.get('Process_temperature'),
                "rpm": sensor_data.get('Rotational_speed'),
                "torque": sensor_data.get('Torque'),
                "tool_wear": sensor_data.get('Tool_wear'),
                "machine_type": sensor_data.get('Type')
            },
            "timestamp": sensor_data.get('datetime')
        }

    except Exception as e:
        return {"status": "error", "error": f"Prediction failed: {str(e)}"}


# --------------------------------------
# 3. Predict function (batch)
# --------------------------------------
def predict_batch(models, sensor_data_list):
    results = []
    for sensor_data in sensor_data_list:
        result = predict_single(models, sensor_data)
        results.append(result)
    return results


# --------------------------------------
# 4. Main loop - read JSON from stdin
# --------------------------------------
if __name__ == "__main__":
    models = load_models()

    # Expect a JSON array from stdin
    input_text = sys.stdin.read().strip()
    if not input_text:
        print(json.dumps({"status": "error", "error": "No input provided"}))
        sys.exit(1)

    try:
        sensor_inputs = json.loads(input_text)
        if isinstance(sensor_inputs, dict):
            # Single input converted to list
            sensor_inputs = [sensor_inputs]
        elif not isinstance(sensor_inputs, list):
            raise ValueError("Input must be a JSON object or array of objects")

        results = predict_batch(models, sensor_inputs)
        print(json.dumps(results))
        sys.stdout.flush()

    except Exception as e:
        error_output = {"status": "error", "error": str(e)}
        print(json.dumps(error_output))
        sys.stdout.flush()