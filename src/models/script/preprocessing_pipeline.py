import numpy as np
import pandas as pd
import joblib
from datetime import datetime
from typing import Dict, List
import warnings

warnings.filterwarnings('ignore')


class PreprocessingPipeline:
    """
    Production preprocessing pipeline.
    Transforms raw sensor data into 18 features for model prediction.
    """
    
    def __init__(self):
        self.feature_columns = [
            # Sensor features (5)
            'Air_temperature',
            'Process_temperature',
            'Rotational_speed',
            'Torque',
            'Tool_wear',
            
            # Engineered features (5)
            'Temp_Difference',
            'Power',
            'Torque_Speed_Ratio',
            'Temp_Rate_of_Change',
            'RPM_Variance',
            
            # Datetime features (3)
            'month',
            'hour',
            'dayofweek',
            
            # Temporal features (2)
            'machine_age_hours',
            'hours_since_last',
            
            # Machine type (3)
            'Type_H',
            'Type_L',
            'Type_M'
        ]
        
        self.is_fitted = False
        
    def transform_single(self, data: Dict) -> np.ndarray:
        """Transform single sensor reading into 18 features."""
        # Raw sensor values
        air_temp = float(data.get('Air_temperature', 300.0))
        process_temp = float(data.get('Process_temperature', 310.0))
        rpm = float(data.get('Rotational_speed', 1500))
        torque = float(data.get('Torque', 40.0))
        tool_wear = float(data.get('Tool_wear', 100))
        
        # Engineered features
        temp_difference = process_temp - air_temp
        power = torque * rpm / 9.5488
        torque_speed_ratio = torque / (rpm + 1)
        
        temp_rate_of_change = float(data.get('Temp_Rate_of_Change', 0.0))
        rpm_variance = float(data.get('RPM_Variance', 20.0))
        
        # Datetime features
        dt_str = data.get('datetime', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        dt = pd.to_datetime(dt_str)
        month = dt.month
        hour = dt.hour
        dayofweek = dt.dayofweek
        
        # Temporal features
        machine_age_hours = float(data.get('machine_age_hours', 10000))
        hours_since_last = float(data.get('hours_since_last', 8))
        
        # Machine type one-hot
        machine_type = data.get('Type', 'M')
        type_h = 1 if machine_type == 'H' else 0
        type_l = 1 if machine_type == 'L' else 0
        type_m = 1 if machine_type == 'M' else 0
        
        # Feature vector
        features = [
            air_temp, process_temp, rpm, torque, tool_wear,
            temp_difference, power, torque_speed_ratio, temp_rate_of_change, rpm_variance,
            month, hour, dayofweek,
            machine_age_hours, hours_since_last,
            type_h, type_l, type_m
        ]
        
        return np.array(features).reshape(1, -1)
    
    def transform_batch(self, data_list: List[Dict]) -> np.ndarray:
        """Transform multiple sensor readings."""
        return np.vstack([self.transform_single(d) for d in data_list])
    
    def fit_transform(self, df: pd.DataFrame) -> np.ndarray:
        """Fit and transform dataframe (for training)."""
        self.is_fitted = True
        data_list = df.to_dict('records')
        return self.transform_batch(data_list)
    
    def get_feature_names(self) -> List[str]:
        """Get list of feature names in order."""
        return self.feature_columns.copy()
    
    def save(self, filepath: str):
        """Save pipeline to file."""
        joblib.dump(self, filepath)
        # print removed for clean backend usage
    
    @staticmethod
    def load(filepath: str):
        """Load pipeline from file."""
        pipeline = joblib.load(filepath)
        return pipeline
    
    def validate_input(self, data: Dict) -> tuple:
        """Validate input data."""
        required_fields = ['Air_temperature', 'Process_temperature', 'Rotational_speed', 'Torque', 'Tool_wear', 'Type']
        
        missing = [f for f in required_fields if f not in data]
        if missing:
            return False, f"Missing required fields: {', '.join(missing)}"
        
        try:
            air_temp = float(data['Air_temperature'])
            process_temp = float(data['Process_temperature'])
            rpm = float(data['Rotational_speed'])
            torque = float(data['Torque'])
            tool_wear = float(data['Tool_wear'])
            
            if not 200 <= air_temp <= 400: return False, f"Air_temperature out of range: {air_temp}"
            if not 200 <= process_temp <= 400: return False, f"Process_temperature out of range: {process_temp}"
            if not 1000 <= rpm <= 3000: return False, f"Rotational_speed out of range: {rpm}"
            if not 0 <= torque <= 100: return False, f"Torque out of range: {torque}"
            if not 0 <= tool_wear <= 300: return False, f"Tool_wear out of range: {tool_wear}"
            
            if data['Type'] not in ['H', 'M', 'L']:
                return False, f"Invalid Type: {data['Type']}"
            
        except (ValueError, TypeError) as e:
            return False, f"Invalid data type: {str(e)}"
        
        return True, ""
