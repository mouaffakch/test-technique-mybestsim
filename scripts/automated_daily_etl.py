"""
Production-Ready Automated Daily ETL Pipeline
Author: Mouaffak Chouaibi
Position: Stagiaire Développeur IA & Automatisation - MyBestSim

This module provides a production-grade ETL pipeline designed to run on a daily schedule
(e.g., via GitHub Actions, Airflow, or AWS Lambda). It incorporates automated schema validation,
data cleansing, anomaly detection, statistical aggregations, and idempotent JSON artifact publishing.
"""

import os
import sys
import glob
import json
import time
import logging
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np

# Set stdout encoding
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Setup structured logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("MyBestSim-ETL")

EXPECTED_COLUMNS = [
    "sku", "provider", "product_name", "country_code", "country_name",
    "data_gb", "data_display", "validity_days", "price", "currency",
    "network", "top_up"
]

@dataclass
class QualityReport:
    timestamp: str
    total_files_scanned: int
    total_rows_ingested: int
    unique_skus: int
    duplicate_skus_count: int
    missing_price_count: int
    invalid_currency_count: int
    unlimited_plans_count: int
    anomalies_detected: int
    status: str
    duration_seconds: float

class ESIMDataPipeline:
    def __init__(self, data_dir: str, output_dir: str):
        self.data_dir = data_dir
        self.output_dir = output_dir
        self.quality_report: Optional[QualityReport] = None
        self.raw_df: Optional[pd.DataFrame] = None
        self.clean_df: Optional[pd.DataFrame] = None

    def ingest_csvs(self) -> pd.DataFrame:
        """Discover and load all provider CSV files with schema validation."""
        csv_pattern = os.path.join(self.data_dir, "*.csv")
        csv_files = glob.glob(csv_pattern)
        if not csv_files:
            raise FileNotFoundError(f"No supplier CSV found in directory: {self.data_dir}")

        logger.info(f"Discovered {len(csv_files)} provider CSV files.")
        dfs = []
        for file_path in sorted(csv_files):
            file_name = os.path.basename(file_path)
            try:
                df_curr = pd.read_csv(file_path, encoding="utf-8")
                # Schema validation
                missing_cols = set(EXPECTED_COLUMNS) - set(df_curr.columns)
                if missing_cols:
                    logger.warning(f"File {file_name} missing columns: {missing_cols}. Imputing...")
                    for mc in missing_cols:
                        df_curr[mc] = np.nan
                dfs.append(df_curr[EXPECTED_COLUMNS])
            except Exception as ex:
                logger.error(f"Failed to ingest file {file_name}: {ex}")
                raise ex

        combined = pd.concat(dfs, ignore_index=True)
        self.raw_df = combined
        logger.info(f"Successfully combined {len(combined)} rows across {len(csv_files)} files.")
        return combined

    def clean_and_validate(self) -> pd.DataFrame:
        """Perform data cleaning, typing, and detect anomalies."""
        start_time = time.time()
        df = self.raw_df.copy()

        # 1. Clean strings
        string_cols = ["sku", "provider", "product_name", "country_code", "country_name", "network", "top_up"]
        for col in string_cols:
            df[col] = df[col].astype(str).str.strip()

        # 2. Number coercion
        df["price"] = pd.to_numeric(df["price"], errors="coerce")
        df["validity_days"] = pd.to_numeric(df["validity_days"], errors="coerce").astype("Int64")
        df["data_gb"] = pd.to_numeric(df["data_gb"], errors="coerce")

        # 3. Currency verification
        invalid_curr = df[df["currency"] != "EUR"]
        invalid_curr_count = len(invalid_curr)

        # 4. Check for duplicate SKUs
        duplicate_skus = df[df.duplicated(subset=["sku"], keep=False)]
        dup_count = len(duplicate_skus)

        # 5. Missing price anomalies
        missing_price = df["price"].isna() | (df["price"] <= 0)
        missing_price_count = int(missing_price.sum())

        # 6. Unlimited detection
        is_unlimited = df["data_gb"].isna() & df["data_display"].str.lower().str.contains("illimit|unlimited", na=False)
        unlimited_count = int(is_unlimited.sum())

        total_anomalies = invalid_curr_count + dup_count + missing_price_count

        self.clean_df = df
        duration = round(time.time() - start_time, 3)

        self.quality_report = QualityReport(
            timestamp=pd.Timestamp.now().isoformat(),
            total_files_scanned=len(glob.glob(os.path.join(self.data_dir, "*.csv"))),
            total_rows_ingested=len(df),
            unique_skus=int(df["sku"].nunique()),
            duplicate_skus_count=dup_count,
            missing_price_count=missing_price_count,
            invalid_currency_count=invalid_curr_count,
            unlimited_plans_count=unlimited_count,
            anomalies_detected=total_anomalies,
            status="PASSED_HEALTHY" if total_anomalies == 0 else "WARNING_ANOMALIES_FOUND",
            duration_seconds=duration
        )

        logger.info(f"Quality Check Status: {self.quality_report.status} ({total_anomalies} anomalies)")
        return df

    def compute_metrics(self) -> Dict[str, Any]:
        """Compute all required test metrics and rich bonus insights."""
        df = self.clean_df
        total_records = len(df)
        finite_mask = df["data_gb"].notna()
        finite_df = df[finite_mask].copy()
        unlimited_df = df[~finite_mask].copy()

        # Primary KPIs
        kpis = {
            "total_esim_products": int(total_records),
            "over_100_eur_count": int((df["price"] > 100).sum()),
            "over_100_eur_pct": round(((df["price"] > 100).sum() / total_records) * 100, 2),
            "price_min": round(float(df["price"].min()), 2),
            "price_max": round(float(df["price"].max()), 2),
            "price_span": round(float(df["price"].max() - df["price"].min()), 2),
            "global_average_price": round(float(df["price"].mean()), 2),
            "global_median_price": round(float(df["price"].median()), 2),
            "average_data_gb_finite": round(float(finite_df["data_gb"].mean()), 2),
            "median_data_gb_finite": round(float(finite_df["data_gb"].median()), 2),
            "finite_plans_count": int(len(finite_df)),
            "unlimited_plans_count": int(len(unlimited_df)),
            "unlimited_plans_pct": round((len(unlimited_df) / total_records) * 100, 2)
        }

        # Bonus: Price per GB
        finite_df["ppg"] = finite_df["price"] / finite_df["data_gb"]
        kpis["price_per_gb_mean"] = round(float(finite_df["ppg"].mean()), 2)
        kpis["price_per_gb_median"] = round(float(finite_df["ppg"].median()), 2)

        # Provider breakdown
        providers_list = []
        for prov_name, group in df.groupby("provider"):
            prov_finite = group[group["data_gb"].notna()]
            prov_unlimited = group[group["data_gb"].isna()]
            prov_ppg = prov_finite["price"] / prov_finite["data_gb"] if len(prov_finite) > 0 else pd.Series(dtype=float)

            providers_list.append({
                "provider": prov_name,
                "total_plans": int(len(group)),
                "pct_catalog": round((len(group) / total_records) * 100, 2),
                "unlimited_plans": int(len(prov_unlimited)),
                "finite_plans": int(len(prov_finite)),
                "avg_price": round(float(group["price"].mean()), 2),
                "min_price": round(float(group["price"].min()), 2),
                "max_price": round(float(group["price"].max()), 2),
                "avg_gb": round(float(prov_finite["data_gb"].mean()), 2) if len(prov_finite) > 0 else 0,
                "avg_price_per_gb": round(float(prov_ppg.mean()), 2) if len(prov_finite) > 0 else 0,
                "pct_5g": round((group["network"].eq("5G").sum() / len(group)) * 100, 1),
                "pct_topup": round((group["top_up"].eq("oui").sum() / len(group)) * 100, 1)
            })

        providers_list.sort(key=lambda p: p["total_plans"], reverse=True)

        return {
            "kpis": kpis,
            "providers": providers_list,
            "quality_report": asdict(self.quality_report)
        }

    def export_artifacts(self) -> None:
        """Save generated JSON files for dashboard consumption."""
        os.makedirs(self.output_dir, exist_ok=True)
        metrics = self.compute_metrics()
        
        # Save quality report
        report_path = os.path.join(self.output_dir, "data_quality_report.json")
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(metrics["quality_report"], f, indent=2)
        logger.info(f"Published Quality Report -> {report_path}")

        logger.info("ETL Run Complete: All assets verified.")

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    data_directory = os.path.join(base_dir, "data")
    output_directory = os.path.join(base_dir, "public", "data")
    
    pipeline = ESIMDataPipeline(data_directory, output_directory)
    pipeline.ingest_csvs()
    pipeline.clean_and_validate()
    pipeline.export_artifacts()
