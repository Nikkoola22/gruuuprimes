#!/usr/bin/env python3
"""
Jurisprudence Query Utility - Judilibre & Cour de Cassation Open Data
Permet d'interroger directement les jeux de données Parquet distants (Hugging Face / Judilibre).
"""

import sys
import duckdb

DATASET_URLS = {
    "cassation": "https://huggingface.co/datasets/antoinejeannot/jurisprudence/resolve/main/cour_de_cassation.parquet",
    "appel": "https://huggingface.co/datasets/antoinejeannot/jurisprudence/resolve/main/cour_d_appel.parquet",
    "tj": "https://huggingface.co/datasets/antoinejeannot/jurisprudence/resolve/main/tribunal_judiciaire.parquet",
}

def get_connection():
    con = duckdb.connect()
    con.execute("INSTALL httpfs; LOAD httpfs;")
    return con

def search_decisions(
    jurisdiction="cassation",
    query_text=None,
    number=None,
    start_date=None,
    end_date=None,
    chamber=None,
    formation=None,
    only_bulletin=False,
    limit=5
):
    url = DATASET_URLS.get(jurisdiction, DATASET_URLS["cassation"])
    con = get_connection()
    
    conditions = ["1=1"]
    params = []
    
    if number:
        conditions.append("(number = ? OR list_contains(numbers, ?))")
        params.extend([number, number])
    if query_text:
        conditions.append("(text ILIKE ? OR summary ILIKE ?)")
        params.extend([f"%{query_text}%", f"%{query_text}%"])
    if start_date:
        conditions.append("decision_date >= ?")
        params.append(start_date)
    if end_date:
        conditions.append("decision_date <= ?")
        params.append(end_date)
    if chamber:
        conditions.append("chamber ILIKE ?")
        params.append(f"%{chamber}%")
    if formation:
        conditions.append("formation ILIKE ?")
        params.append(f"%{formation}%")
    if only_bulletin:
        conditions.append("(bulletin IS NOT NULL OR list_contains(publication, 'b') OR list_contains(publication, 'B'))")

        
    where_clause = " AND ".join(conditions)
    sql = f"""
        SELECT 
            decision_date, 
            number, 
            chamber, 
            formation, 
            solution, 
            publication, 
            summary, 
            substr(text, 1, 600) as text_excerpt
        FROM '{url}'
        WHERE {where_clause}
        ORDER BY decision_date DESC
        LIMIT {int(limit)}
    """
    
    # Utilisation de Polars (.pl()) directement avec DuckDB
    try:
        df = con.execute(sql, params).pl()
    except Exception:
        df = con.execute(sql, params).fetch_arrow_table()
    return df

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Recherche dans le fonds Open Data Judilibre (Cour de Cassation, Appel, TJ)")
    parser.add_argument("-j", "--jurisdiction", choices=["cassation", "appel", "tj"], default="cassation")
    parser.add_argument("-q", "--query", help="Mots-clés dans le texte ou le sommaire")
    parser.add_argument("-n", "--number", help="Numéro de pourvoi ou RG (ex: 22-18.423)")
    parser.add_argument("-d", "--start-date", help="Date de début (YYYY-MM-DD)")
    parser.add_argument("-c", "--chamber", help="Chambre (ex: civ1, comm, soc, cr)")
    parser.add_argument("-b", "--bulletin", action="store_true", help="Publié au Bulletin uniquement")
    parser.add_argument("-l", "--limit", type=int, default=3, help="Nombre maximal de résultats")
    
    args = parser.parse_args()
    
    print(f"🔍 Recherche dans '{args.jurisdiction}' (filtres: query='{args.query}', n°='{args.number}', début='{args.start_date}', bulletin={args.bulletin})...\n")
    df = search_decisions(
        jurisdiction=args.jurisdiction,
        query_text=args.query,
        number=args.number,
        start_date=args.start_date,
        chamber=args.chamber,
        only_bulletin=args.bulletin,
        limit=args.limit
    )
    
    if len(df) == 0:
        print("Aucune décision trouvée.")
    else:
        # Parcours des résultats (compatible Polars dataframe)
        for idx, row in enumerate(df.iter_rows(named=True)):
            print(f"=== [{idx+1}] {row['decision_date']} | N° {row['number']} | {row['chamber']} ({row['formation']}) ===")
            print(f"👉 Solution: {row['solution']} | Publication: {row['publication']}")
            if row.get('summary'):
                print(f"📝 Sommaire : {row['summary'][:300]}...")
            elif row.get('text_excerpt'):
                print(f"📄 Extrait : {row['text_excerpt'][:300]}...")
            print("-" * 60)

