"""
ETL & Data Processing Pipeline for MyBestSim
Processes daily provider CSVs, performs data quality checks, calculates all required
and bonus analytics, and exports structured JSON for the dashboard.
"""

import os
import sys
import glob
import json
import pandas as pd
import numpy as np

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
PUBLIC_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data")

def run_etl():
    print("=" * 60)
    print("[ETL] MyBestSim - Starting Automated Data Pipeline")
    print("=" * 60)

    csv_files = glob.glob(os.path.join(DATA_DIR, "*.csv"))
    if not csv_files:
        raise FileNotFoundError(f"No CSV files found in {DATA_DIR}")

    print(f"[INFO] Found {len(csv_files)} provider CSV files.")
    
    dfs = []
    file_metadata = {}
    for filepath in sorted(csv_files):
        filename = os.path.basename(filepath)
        provider_name = filename.replace(".csv", "")
        df_prov = pd.read_csv(filepath, encoding="utf-8")
        dfs.append(df_prov)
        file_metadata[provider_name] = {
            "file": filename,
            "rows": len(df_prov),
            "columns": list(df_prov.columns)
        }

    df = pd.concat(dfs, ignore_index=True)
    total_plans = len(df)
    print(f"[SUCCESS] Ingested {total_plans} total eSIM records across {len(csv_files)} files.")

    # 1. Total eSIM cards
    total_esims = int(total_plans)

    # 2. Products > 100 EUR
    over_100 = df[df["price"] > 100]
    over_100_count = int(len(over_100))
    over_100_pct = round((over_100_count / total_esims) * 100, 2)

    # 3. Price range
    min_price = float(df["price"].min())
    max_price = float(df["price"].max())
    price_span = float(max_price - min_price)

    # 4. Average Data (GB) per card
    # Important nuance: Data can be finite (in data_gb) or 'Illimité' (where data_gb is NaN)
    finite_df = df[df["data_gb"].notna()].copy()
    unlimited_df = df[df["data_gb"].isna()].copy()
    
    avg_data_gb = round(float(finite_df["data_gb"].mean()), 2)
    median_data_gb = round(float(finite_df["data_gb"].median()), 2)
    finite_count = int(len(finite_df))
    unlimited_count = int(len(unlimited_df))
    unlimited_pct = round((unlimited_count / total_esims) * 100, 2)

    # 5. Global average price
    avg_price = round(float(df["price"].mean()), 2)
    median_price = round(float(df["price"].median()), 2)

    # Price per GB calculation on finite offers
    finite_df["price_per_gb"] = finite_df["price"] / finite_df["data_gb"]
    avg_price_per_gb = round(float(finite_df["price_per_gb"].mean()), 2)
    median_price_per_gb = round(float(finite_df["price_per_gb"].median()), 2)

    # 6. Breakdown by provider
    providers_list = []
    prov_grouped = df.groupby("provider")
    
    for prov_name, group in prov_grouped:
        prov_finite = group[group["data_gb"].notna()]
        prov_unlimited = group[group["data_gb"].isna()]
        
        prov_finite_ppg = prov_finite["price"] / prov_finite["data_gb"] if len(prov_finite) > 0 else pd.Series(dtype=float)
        
        pct_5g = round((group["network"].eq("5G").sum() / len(group)) * 100, 1)
        pct_topup = round((group["top_up"].eq("oui").sum() / len(group)) * 100, 1)
        
        providers_list.append({
            "provider": prov_name,
            "total_plans": int(len(group)),
            "pct_catalog": round((len(group) / total_esims) * 100, 2),
            "finite_plans": int(len(prov_finite)),
            "unlimited_plans": int(len(prov_unlimited)),
            "min_price": round(float(group["price"].min()), 2),
            "max_price": round(float(group["price"].max()), 2),
            "avg_price": round(float(group["price"].mean()), 2),
            "median_price": round(float(group["price"].median()), 2),
            "avg_gb": round(float(prov_finite["data_gb"].mean()), 2) if len(prov_finite) > 0 else 0,
            "avg_price_per_gb": round(float(prov_finite_ppg.mean()), 2) if len(prov_finite) > 0 else 0,
            "median_price_per_gb": round(float(prov_finite_ppg.median()), 2) if len(prov_finite) > 0 else 0,
            "pct_5g": pct_5g,
            "pct_topup": pct_topup
        })

    # Sort providers by volume descending
    providers_list.sort(key=lambda x: x["total_plans"], reverse=True)

    # 7. Bonus Statistics
    # 7a. Network: 4G vs 5G
    net_4g = df[df["network"] == "4G"]
    net_5g = df[df["network"] == "5G"]
    network_stats = {
        "count_4g": int(len(net_4g)),
        "count_5g": int(len(net_5g)),
        "pct_4g": round((len(net_4g) / total_esims) * 100, 2),
        "pct_5g": round((len(net_5g) / total_esims) * 100, 2),
        "avg_price_4g": round(float(net_4g["price"].mean()), 2),
        "avg_price_5g": round(float(net_5g["price"].mean()), 2),
        "premium_5g_pct": round(((net_5g["price"].mean() - net_4g["price"].mean()) / net_4g["price"].mean()) * 100, 1)
    }

    # 7b. Top-Up (Rechargeabilité)
    topup_yes = df[df["top_up"] == "oui"]
    topup_no = df[df["top_up"] == "non"]
    topup_stats = {
        "count_yes": int(len(topup_yes)),
        "count_no": int(len(topup_no)),
        "pct_yes": round((len(topup_yes) / total_esims) * 100, 2),
        "pct_no": round((len(topup_no) / total_esims) * 100, 2),
        "avg_price_yes": round(float(topup_yes["price"].mean()), 2),
        "avg_price_no": round(float(topup_no["price"].mean()), 2)
    }

    # 7c. Validity Duration
    validity_stats = []
    for days in sorted(df["validity_days"].unique()):
        subset = df[df["validity_days"] == days]
        validity_stats.append({
            "days": int(days),
            "label": f"{days} jours",
            "count": int(len(subset)),
            "pct": round((len(subset) / total_esims) * 100, 2),
            "avg_price": round(float(subset["price"].mean()), 2),
            "min_price": round(float(subset["price"].min()), 2),
            "max_price": round(float(subset["price"].max()), 2)
        })

    # 7d. Price Distribution Buckets
    bins = [0, 10, 25, 50, 100, float("inf")]
    labels = ["Moins de 10 €", "10 € à 25 €", "25 € à 50 €", "50 € à 100 €", "Plus de 100 €"]
    df["price_bucket"] = pd.cut(df["price"], bins=bins, labels=labels, right=True)
    price_distribution = []
    for bucket in labels:
        cnt = int((df["price_bucket"] == bucket).sum())
        price_distribution.append({
            "bucket": bucket,
            "count": cnt,
            "pct": round((cnt / total_esims) * 100, 2)
        })

    # 7e. Geographic Destinations
    dest_grouped = df.groupby(["country_name", "country_code"]).agg(
        total_plans=("sku", "count"),
        avg_price=("price", "mean"),
        min_price=("price", "min"),
        has_unlimited=("data_gb", lambda x: int(x.isna().sum()))
    ).reset_index()
    dest_grouped = dest_grouped.sort_values(by="total_plans", ascending=False)
    
    top_destinations = []
    for _, row in dest_grouped.head(15).iterrows():
        top_destinations.append({
            "country_name": row["country_name"],
            "country_code": row["country_code"],
            "total_plans": int(row["total_plans"]),
            "avg_price": round(float(row["avg_price"]), 2),
            "min_price": round(float(row["min_price"]), 2),
            "unlimited_plans": int(row["has_unlimited"])
        })

    # 7f. Data volume tier distribution (for finite data)
    gb_counts = finite_df["data_gb"].value_counts().sort_index()
    gb_tiers = []
    for gb_val, count in gb_counts.items():
        gb_tiers.append({
            "gb": int(gb_val),
            "label": f"{int(gb_val)} Go",
            "count": int(count),
            "pct": round((count / total_esims) * 100, 2)
        })

    # Compile the final summary object
    summary = {
        "metadata": {
            "generated_at": pd.Timestamp.now().isoformat(),
            "source_files_count": len(csv_files),
            "total_records": total_esims,
            "pipeline_version": "2.4.0-prod",
            "currency": "EUR"
        },
        "kpis": {
            "total_esim_products": total_esims,
            "over_100_eur_count": over_100_count,
            "over_100_eur_pct": over_100_pct,
            "price_range": {
                "min": min_price,
                "max": max_price,
                "amplitude": round(price_span, 2),
                "currency": "EUR"
            },
            "data_gb_avg_finite": avg_data_gb,
            "data_gb_median_finite": median_data_gb,
            "finite_plans_count": finite_count,
            "finite_plans_pct": round((finite_count / total_esims) * 100, 2),
            "unlimited_plans_count": unlimited_count,
            "unlimited_plans_pct": unlimited_pct,
            "global_average_price": avg_price,
            "global_median_price": median_price,
            "price_per_gb_avg": avg_price_per_gb,
            "price_per_gb_median": median_price_per_gb
        },
        "providers": providers_list,
        "network": network_stats,
        "top_up": topup_stats,
        "validity": validity_stats,
        "price_distribution": price_distribution,
        "gb_tiers": gb_tiers,
        "top_destinations": top_destinations,
        "distinct_destinations_count": int(df["country_name"].nunique())
    }

    # Write summary stats JSON & JS (for zero-CORS offline & online loading)
    os.makedirs(PUBLIC_DATA_DIR, exist_ok=True)
    summary_path = os.path.join(PUBLIC_DATA_DIR, "summary_stats.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    
    summary_js_path = os.path.join(PUBLIC_DATA_DIR, "summary_stats.js")
    with open(summary_js_path, "w", encoding="utf-8") as f:
        f.write("window.SUMMARY_DATA = " + json.dumps(summary, ensure_ascii=False) + ";\n")
    print(f"[OUTPUT] Summary statistics saved to: {summary_path} and {summary_js_path}")

    # Prepare catalog dataset for client-side search & filtering
    # Clean records, replace NaN data_gb with null/None
    catalog_records = []
    for _, row in df.iterrows():
        catalog_records.append({
            "sku": row["sku"],
            "prov": row["provider"],
            "name": row["product_name"],
            "cc": row["country_code"],
            "country": row["country_name"],
            "gb": None if pd.isna(row["data_gb"]) else float(row["data_gb"]),
            "disp": row["data_display"],
            "days": int(row["validity_days"]),
            "price": round(float(row["price"]), 2),
            "net": row["network"],
            "topup": row["top_up"]
        })

    catalog_path = os.path.join(PUBLIC_DATA_DIR, "catalog.json")
    with open(catalog_path, "w", encoding="utf-8") as f:
        json.dump(catalog_records, f, ensure_ascii=False, separators=(",", ":"))
    
    catalog_js_path = os.path.join(PUBLIC_DATA_DIR, "catalog.js")
    with open(catalog_js_path, "w", encoding="utf-8") as f:
        f.write("window.CATALOG_DATA = " + json.dumps(catalog_records, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print(f"[OUTPUT] Full catalog JSON & JS saved to: {catalog_path} and {catalog_js_path} ({len(catalog_records)} records)")

    print("\n" + "=" * 60)
    print("[RESULTS] OFFICIAL TEST ANSWERS (MYBESTSIM RECRUITMENT):")
    print(f"1. Nombre total de cartes eSIM : {total_esims}")
    print(f"2. Nombre de produits a plus de 100 EUR : {over_100_count} ({over_100_pct}%)")
    print(f"3. Fourchette de prix globale : {min_price:.2f} EUR a {max_price:.2f} EUR (ecart: {price_span:.2f} EUR)")
    print(f"4. Moyenne de data (Go) par carte : {avg_data_gb} Go (sur {finite_count} offres a volume fini) + {unlimited_count} forfaits Illimites ({unlimited_pct}%)")
    print(f"5. Prix moyen global : {avg_price:.2f} EUR (Mediane : {median_price:.2f} EUR)")
    print(f"6. Repartition par fournisseur ({len(providers_list)} fournisseurs) :")
    for p in providers_list:
        print(f"   * {p['provider']:<12}: {p['total_plans']:>4} offres ({p['pct_catalog']:>5.2f}%) | Prix moy: {p['avg_price']:>5.2f} EUR | Go moy: {p['avg_gb']:>4.1f} Go")
    print("=" * 60)

if __name__ == "__main__":
    run_etl()
