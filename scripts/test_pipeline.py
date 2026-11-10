"""
Unit Tests for MyBestSim Data Ingestion & Statistical Pipeline
Verifies key invariants, question answers, and statistical consistency.
"""

import os
import sys
import unittest
import json
import pandas as pd
import glob

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(BASE_DIR, "data")
PUBLIC_DATA = os.path.join(BASE_DIR, "public", "data")

class TestESIMPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        summary_file = os.path.join(PUBLIC_DATA, "summary_stats.json")
        with open(summary_file, "r", encoding="utf-8") as f:
            cls.summary = json.load(f)

        csv_files = glob.glob(os.path.join(DATA_DIR, "*.csv"))
        dfs = [pd.read_csv(f) for f in csv_files]
        cls.raw_df = pd.concat(dfs, ignore_index=True)

    def test_total_esim_count(self):
        """Question 1: Total eSIM count must strictly equal 5,056."""
        self.assertEqual(self.summary["kpis"]["total_esim_products"], 5056)
        self.assertEqual(len(self.raw_df), 5056)

    def test_over_100_eur_count(self):
        """Question 2: Products over 100 EUR must strictly equal 56."""
        raw_over_100 = (self.raw_df["price"] > 100).sum()
        self.assertEqual(raw_over_100, 56)
        self.assertEqual(self.summary["kpis"]["over_100_eur_count"], 56)

    def test_price_range(self):
        """Question 3: Price range must be 5.36 EUR to 154.63 EUR."""
        min_p = float(self.raw_df["price"].min())
        max_p = float(self.raw_df["price"].max())
        self.assertAlmostEqual(min_p, 5.36, places=2)
        self.assertAlmostEqual(max_p, 154.63, places=2)
        self.assertEqual(self.summary["kpis"]["price_range"]["min"], 5.36)
        self.assertEqual(self.summary["kpis"]["price_range"]["max"], 154.63)

    def test_average_data_gb(self):
        """Question 4: Finite data mean must be 14.49 GB with 653 unlimited offers."""
        finite = self.raw_df[self.raw_df["data_gb"].notna()]
        unlimited = self.raw_df[self.raw_df["data_gb"].isna()]
        self.assertEqual(len(unlimited), 653)
        self.assertEqual(len(finite), 4403)
        self.assertAlmostEqual(float(finite["data_gb"].mean()), 14.49, places=2)

    def test_average_price(self):
        """Question 5: Global average price must be 29.30 EUR."""
        avg_price = float(self.raw_df["price"].mean())
        self.assertAlmostEqual(avg_price, 29.30, places=2)
        self.assertEqual(self.summary["kpis"]["global_average_price"], 29.30)

    def test_provider_breakdown(self):
        """Question 6: 18 providers with total sum equaling 5056."""
        providers = self.summary["providers"]
        self.assertEqual(len(providers), 18)
        total_sum = sum(p["total_plans"] for p in providers)
        self.assertEqual(total_sum, 5056)
        
        # Verify Airalo is top provider with 722
        top_provider = providers[0]
        self.assertEqual(top_provider["provider"], "Airalo")
        self.assertEqual(top_provider["total_plans"], 722)

    def test_all_currencies_eur(self):
        """Invariant: All products must be billed in EUR."""
        unique_curr = self.raw_df["currency"].unique()
        self.assertEqual(list(unique_curr), ["EUR"])

    def test_na_country_code_and_weighted_price(self):
        """QA Edge Case: Verify 'NA' country code preserved & volume-weighted price per GB is 1.70 EUR."""
        self.assertEqual(self.summary["pricing_insights"]["qa_na_country_code_count"], 192)
        self.assertAlmostEqual(self.summary["kpis"]["price_per_gb_weighted"], 1.70, places=2)

if __name__ == "__main__":
    unittest.main()
