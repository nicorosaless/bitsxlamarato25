"""
NEST - NSMP Endometrial Stratification Tool
Exploratory Data Analysis (EDA)

Hospital de la Santa Creu i Sant Pau
BitsxlaMarató 2024
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Configuración de estilo
plt.style.use('seaborn-v0_8-whitegrid')
sns.set_palette("husl")
plt.rcParams['figure.figsize'] = (12, 8)
plt.rcParams['font.size'] = 12

# Rutas
DATA_PATH = Path(__file__).parent / "data" / "endometrio_data.csv"
OUTPUT_PATH = Path(__file__).parent / "outputs"
OUTPUT_PATH.mkdir(exist_ok=True)


def load_data():
    """Carga el dataset de cáncer de endometrio NSMP."""
    df = pd.read_csv(DATA_PATH)
    print(f"✅ Dataset cargado: {df.shape[0]} pacientes, {df.shape[1]} variables")
    return df


def basic_info(df):
    """Información básica del dataset."""
    print("\n" + "="*60)
    print("INFORMACIÓN BÁSICA DEL DATASET")
    print("="*60)
    
    print(f"\n📊 Dimensiones: {df.shape[0]} filas × {df.shape[1]} columnas")
    
    # Tipos de datos
    print(f"\n📋 Tipos de datos:")
    print(f"   - Numéricos: {df.select_dtypes(include=[np.number]).shape[1]}")
    print(f"   - Categóricos/Object: {df.select_dtypes(include=['object']).shape[1]}")
    
    # Missing values
    missing = df.isnull().sum()
    missing_pct = (missing / len(df) * 100).round(1)
    high_missing = missing_pct[missing_pct > 50]
    print(f"\n❌ Variables con >50% missing: {len(high_missing)}")
    
    return df


def target_analysis(df):
    """Análisis de las variables objetivo."""
    print("\n" + "="*60)
    print("ANÁLISIS DE VARIABLES OBJETIVO")
    print("="*60)
    
    # Recidiva
    print("\n🎯 RECIDIVA:")
    recidiva_map = {0: "No recidiva", 1: "Recidiva", 2: "Pérdida seguimiento"}
    recidiva_counts = df['recidiva'].value_counts().sort_index()
    for val, count in recidiva_counts.items():
        pct = count / len(df) * 100
        print(f"   {recidiva_map.get(val, val)}: {count} ({pct:.1f}%)")
    
    # Tiempo hasta evento
    tiempo = df['diferencia_dias_reci_exit'].dropna()
    print(f"\n⏱️ TIEMPO HASTA EVENTO (días):")
    print(f"   - N válidos: {len(tiempo)}")
    print(f"   - Mediana: {tiempo.median():.0f} días ({tiempo.median()/365:.1f} años)")
    print(f"   - Rango: {tiempo.min():.0f} - {tiempo.max():.0f} días")
    print(f"   - Media: {tiempo.mean():.0f} ± {tiempo.std():.0f} días")
    
    # Crear figura
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    
    # Gráfico de recidiva
    colors = ['#10B981', '#EF4444', '#9CA3AF']
    df_valid = df[df['recidiva'].isin([0, 1, 2])]
    recidiva_data = df_valid['recidiva'].map(recidiva_map)
    ax1 = axes[0]
    recidiva_data.value_counts().plot(kind='pie', autopct='%1.1f%%', colors=colors, ax=ax1)
    ax1.set_title('Distribución de Recidiva', fontsize=14, fontweight='bold')
    ax1.set_ylabel('')
    
    # Histograma de tiempo
    ax2 = axes[1]
    tiempo_meses = tiempo / 30.44
    ax2.hist(tiempo_meses, bins=30, color='#6366F1', edgecolor='white', alpha=0.8)
    ax2.axvline(tiempo_meses.median(), color='#EF4444', linestyle='--', linewidth=2, label=f'Mediana: {tiempo_meses.median():.0f} meses')
    ax2.set_xlabel('Tiempo (meses)', fontsize=12)
    ax2.set_ylabel('Frecuencia', fontsize=12)
    ax2.set_title('Tiempo hasta Recidiva/Último Seguimiento', fontsize=14, fontweight='bold')
    ax2.legend()
    
    plt.tight_layout()
    plt.savefig(OUTPUT_PATH / 'target_analysis.png', dpi=150, bbox_inches='tight')
    plt.close()
    print(f"\n📈 Gráfico guardado: {OUTPUT_PATH / 'target_analysis.png'}")


def clinical_variables_analysis(df):
    """Análisis de variables clínicas."""
    print("\n" + "="*60)
    print("ANÁLISIS DE VARIABLES CLÍNICAS")
    print("="*60)
    
    # Edad
    print("\n👤 EDAD:")
    print(f"   - Media: {df['edad'].mean():.1f} ± {df['edad'].std():.1f} años")
    print(f"   - Mediana: {df['edad'].median():.0f} años")
    print(f"   - Rango: {df['edad'].min():.0f} - {df['edad'].max():.0f} años")
    
    # IMC
    imc = df['imc'].dropna()
    print(f"\n⚖️ IMC:")
    print(f"   - Media: {imc.mean():.1f} ± {imc.std():.1f} kg/m²")
    print(f"   - Obesidad (IMC≥30): {(imc >= 30).sum()} ({(imc >= 30).mean()*100:.1f}%)")
    print(f"   - Missing: {df['imc'].isna().sum()}")
    
    # Crear figura
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    
    # Edad por recidiva
    df_valid = df[df['recidiva'].isin([0, 1])].copy()
    df_valid['recidiva_label'] = df_valid['recidiva'].map({0: 'No Recidiva', 1: 'Recidiva'})
    
    ax1 = axes[0, 0]
    sns.boxplot(data=df_valid, x='recidiva_label', y='edad', palette=['#10B981', '#EF4444'], ax=ax1)
    ax1.set_xlabel('')
    ax1.set_ylabel('Edad (años)')
    ax1.set_title('Edad por Estado de Recidiva', fontsize=14, fontweight='bold')
    
    # IMC por recidiva
    ax2 = axes[0, 1]
    sns.boxplot(data=df_valid, x='recidiva_label', y='imc', palette=['#10B981', '#EF4444'], ax=ax2)
    ax2.set_xlabel('')
    ax2.set_ylabel('IMC (kg/m²)')
    ax2.set_title('IMC por Estado de Recidiva', fontsize=14, fontweight='bold')
    
    # Distribución de edad
    ax3 = axes[1, 0]
    ax3.hist(df['edad'], bins=25, color='#6366F1', edgecolor='white', alpha=0.8)
    ax3.axvline(df['edad'].mean(), color='#EF4444', linestyle='--', linewidth=2, label=f'Media: {df["edad"].mean():.1f}')
    ax3.set_xlabel('Edad (años)')
    ax3.set_ylabel('Frecuencia')
    ax3.set_title('Distribución de Edad', fontsize=14, fontweight='bold')
    ax3.legend()
    
    # Distribución de IMC
    ax4 = axes[1, 1]
    ax4.hist(imc, bins=25, color='#F59E0B', edgecolor='white', alpha=0.8)
    ax4.axvline(30, color='#EF4444', linestyle='--', linewidth=2, label='Obesidad (IMC≥30)')
    ax4.set_xlabel('IMC (kg/m²)')
    ax4.set_ylabel('Frecuencia')
    ax4.set_title('Distribución de IMC', fontsize=14, fontweight='bold')
    ax4.legend()
    
    plt.tight_layout()
    plt.savefig(OUTPUT_PATH / 'clinical_variables.png', dpi=150, bbox_inches='tight')
    plt.close()
    print(f"\n📈 Gráfico guardado: {OUTPUT_PATH / 'clinical_variables.png'}")


def histopathological_analysis(df):
    """Análisis de variables histopatológicas."""
    print("\n" + "="*60)
    print("ANÁLISIS DE VARIABLES HISTOPATOLÓGICAS")
    print("="*60)
    
    # Grado histológico
    grado_map = {1.0: "Grado 1 (Bajo)", 2.0: "Grado 2 (Alto)"}
    grado = df['grado_histologi'].dropna()
    print("\n🔬 GRADO HISTOLÓGICO:")
    for val, count in grado.value_counts().sort_index().items():
        pct = count / len(grado) * 100
        print(f"   {grado_map.get(val, val)}: {count} ({pct:.1f}%)")
    
    # Infiltración miometrial
    infiltr_map = {0.0: "Sin infiltración", 1.0: "<50%", 2.0: "≥50%", 3.0: "Serosa/anexos"}
    infiltr = df['infiltracion_mi'].dropna()
    print("\n📐 INFILTRACIÓN MIOMETRIAL:")
    for val, count in infiltr.value_counts().sort_index().items():
        pct = count / len(infiltr) * 100
        print(f"   {infiltr_map.get(val, val)}: {count} ({pct:.1f}%)")
    
    # LVSI
    lvsi = df['afectacion_linf'].dropna()
    print("\n🩸 AFECTACIÓN LINFOVASCULAR (LVSI):")
    print(f"   No: {(lvsi == 0).sum()} ({(lvsi == 0).mean()*100:.1f}%)")
    print(f"   Sí: {(lvsi == 1).sum()} ({(lvsi == 1).mean()*100:.1f}%)")
    
    # Tamaño tumoral
    tamano = df['tamano_tumoral'].dropna()
    print(f"\n📏 TAMAÑO TUMORAL:")
    print(f"   - Media: {tamano.mean():.1f} ± {tamano.std():.1f} cm")
    print(f"   - Mediana: {tamano.median():.1f} cm")
    print(f"   - Rango: {tamano.min():.1f} - {tamano.max():.1f} cm")
    
    # Estadio FIGO
    figo = df['FIGO2023'].dropna()
    print(f"\n🏥 ESTADIO FIGO 2023:")
    print(f"   - Estadio I (1-3): {((figo >= 1) & (figo <= 3)).sum()} ({((figo >= 1) & (figo <= 3)).mean()*100:.1f}%)")
    print(f"   - Estadio II (4): {(figo == 4).sum()} ({(figo == 4).mean()*100:.1f}%)")
    print(f"   - Estadio III (5-8): {((figo >= 5) & (figo <= 8)).sum()} ({((figo >= 5) & (figo <= 8)).mean()*100:.1f}%)")
    print(f"   - Estadio IV (9+): {(figo >= 9).sum()} ({(figo >= 9).mean()*100:.1f}%)")
    
    # Crear figura
    fig, axes = plt.subplots(2, 3, figsize=(16, 10))
    
    df_valid = df[df['recidiva'].isin([0, 1])].copy()
    df_valid['recidiva_label'] = df_valid['recidiva'].map({0: 'No Recidiva', 1: 'Recidiva'})
    
    # Grado por recidiva
    ax1 = axes[0, 0]
    grado_recidiva = pd.crosstab(df_valid['grado_histologi'].map(grado_map), df_valid['recidiva_label'], normalize='index') * 100
    grado_recidiva.plot(kind='bar', ax=ax1, color=['#10B981', '#EF4444'], edgecolor='white')
    ax1.set_title('Grado Histológico vs Recidiva', fontsize=12, fontweight='bold')
    ax1.set_xlabel('')
    ax1.set_ylabel('Porcentaje (%)')
    ax1.legend(title='')
    ax1.tick_params(axis='x', rotation=0)
    
    # Infiltración por recidiva
    ax2 = axes[0, 1]
    infiltr_recidiva = pd.crosstab(df_valid['infiltracion_mi'].map(infiltr_map), df_valid['recidiva_label'], normalize='index') * 100
    infiltr_recidiva.plot(kind='bar', ax=ax2, color=['#10B981', '#EF4444'], edgecolor='white')
    ax2.set_title('Infiltración Miometrial vs Recidiva', fontsize=12, fontweight='bold')
    ax2.set_xlabel('')
    ax2.set_ylabel('Porcentaje (%)')
    ax2.legend(title='')
    ax2.tick_params(axis='x', rotation=45)
    
    # LVSI por recidiva
    ax3 = axes[0, 2]
    lvsi_map = {0.0: "No LVSI", 1.0: "LVSI+"}
    lvsi_recidiva = pd.crosstab(df_valid['afectacion_linf'].map(lvsi_map), df_valid['recidiva_label'], normalize='index') * 100
    lvsi_recidiva.plot(kind='bar', ax=ax3, color=['#10B981', '#EF4444'], edgecolor='white')
    ax3.set_title('LVSI vs Recidiva', fontsize=12, fontweight='bold')
    ax3.set_xlabel('')
    ax3.set_ylabel('Porcentaje (%)')
    ax3.legend(title='')
    ax3.tick_params(axis='x', rotation=0)
    
    # Tamaño tumoral por recidiva
    ax4 = axes[1, 0]
    sns.boxplot(data=df_valid, x='recidiva_label', y='tamano_tumoral', palette=['#10B981', '#EF4444'], ax=ax4)
    ax4.set_xlabel('')
    ax4.set_ylabel('Tamaño (cm)')
    ax4.set_title('Tamaño Tumoral vs Recidiva', fontsize=12, fontweight='bold')
    
    # Distribución tamaño tumoral
    ax5 = axes[1, 1]
    ax5.hist(tamano, bins=20, color='#8B5CF6', edgecolor='white', alpha=0.8)
    ax5.axvline(2, color='#EF4444', linestyle='--', linewidth=2, label='2 cm')
    ax5.set_xlabel('Tamaño Tumoral (cm)')
    ax5.set_ylabel('Frecuencia')
    ax5.set_title('Distribución Tamaño Tumoral', fontsize=12, fontweight='bold')
    ax5.legend()
    
    # FIGO distribution
    ax6 = axes[1, 2]
    figo_counts = df_valid['FIGO2023'].value_counts().sort_index()
    ax6.bar(figo_counts.index.astype(int), figo_counts.values, color='#06B6D4', edgecolor='white')
    ax6.set_xlabel('Estadio FIGO 2023')
    ax6.set_ylabel('Frecuencia')
    ax6.set_title('Distribución Estadio FIGO', fontsize=12, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig(OUTPUT_PATH / 'histopathological_analysis.png', dpi=150, bbox_inches='tight')
    plt.close()
    print(f"\n📈 Gráfico guardado: {OUTPUT_PATH / 'histopathological_analysis.png'}")


def molecular_analysis(df):
    """Análisis de variables moleculares."""
    print("\n" + "="*60)
    print("ANÁLISIS DE VARIABLES MOLECULARES")
    print("="*60)
    
    # p53
    p53_map = {1.0: "Normal", 2.0: "Aberrante", 3.0: "No disponible"}
    p53 = df['p53_ihq'].dropna()
    print("\n🧬 p53 IHQ:")
    for val, count in p53.value_counts().sort_index().items():
        pct = count / len(p53) * 100
        print(f"   {p53_map.get(val, val)}: {count} ({pct:.1f}%)")
    
    # MMR proteins
    print("\n🔬 PROTEÍNAS MMR (Mismatch Repair):")
    mmr_cols = ['msh2', 'msh6', 'pms2', 'mlh1']
    for col in mmr_cols:
        normal = (df[col] == 0).sum()
        lost = (df[col] == 2).sum()
        total = df[col].notna().sum()
        print(f"   {col.upper()}: Normal={normal} ({normal/total*100:.1f}%), Pérdida={lost} ({lost/total*100:.1f}%)")
    
    # Receptores hormonales
    er = df['recep_est_porcent'].dropna()
    pr = df['rece_de_Ppor'].dropna()
    print(f"\n💊 RECEPTORES HORMONALES:")
    print(f"   ER: Media={er.mean():.1f}%, Mediana={er.median():.0f}%")
    print(f"   PR: Media={pr.mean():.1f}%, Mediana={pr.median():.0f}%")
    print(f"   ER+ (≥1%): {(er >= 1).sum()} ({(er >= 1).mean()*100:.1f}%)")
    print(f"   PR+ (≥1%): {(pr >= 1).sum()} ({(pr >= 1).mean()*100:.1f}%)")
    
    # Crear figura
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    
    df_valid = df[df['recidiva'].isin([0, 1])].copy()
    df_valid['recidiva_label'] = df_valid['recidiva'].map({0: 'No Recidiva', 1: 'Recidiva'})
    
    # p53 por recidiva
    ax1 = axes[0, 0]
    p53_recidiva = pd.crosstab(df_valid['p53_ihq'].map(p53_map), df_valid['recidiva_label'], normalize='index') * 100
    p53_recidiva.plot(kind='bar', ax=ax1, color=['#10B981', '#EF4444'], edgecolor='white')
    ax1.set_title('p53 IHQ vs Recidiva', fontsize=12, fontweight='bold')
    ax1.set_xlabel('')
    ax1.set_ylabel('Porcentaje (%)')
    ax1.legend(title='')
    ax1.tick_params(axis='x', rotation=0)
    
    # ER por recidiva
    ax2 = axes[0, 1]
    sns.boxplot(data=df_valid, x='recidiva_label', y='recep_est_porcent', palette=['#10B981', '#EF4444'], ax=ax2)
    ax2.set_xlabel('')
    ax2.set_ylabel('ER (%)')
    ax2.set_title('Receptores Estrógenos vs Recidiva', fontsize=12, fontweight='bold')
    
    # PR por recidiva
    ax3 = axes[1, 0]
    sns.boxplot(data=df_valid, x='recidiva_label', y='rece_de_Ppor', palette=['#10B981', '#EF4444'], ax=ax3)
    ax3.set_xlabel('')
    ax3.set_ylabel('PR (%)')
    ax3.set_title('Receptores Progesterona vs Recidiva', fontsize=12, fontweight='bold')
    
    # Correlación ER-PR
    ax4 = axes[1, 1]
    scatter_colors = df_valid['recidiva'].map({0: '#10B981', 1: '#EF4444'})
    ax4.scatter(df_valid['recep_est_porcent'], df_valid['rece_de_Ppor'], c=scatter_colors, alpha=0.6, s=50)
    ax4.set_xlabel('ER (%)')
    ax4.set_ylabel('PR (%)')
    ax4.set_title('Correlación ER vs PR', fontsize=12, fontweight='bold')
    # Legend
    from matplotlib.patches import Patch
    legend_elements = [Patch(facecolor='#10B981', label='No Recidiva'),
                       Patch(facecolor='#EF4444', label='Recidiva')]
    ax4.legend(handles=legend_elements)
    
    plt.tight_layout()
    plt.savefig(OUTPUT_PATH / 'molecular_analysis.png', dpi=150, bbox_inches='tight')
    plt.close()
    print(f"\n📈 Gráfico guardado: {OUTPUT_PATH / 'molecular_analysis.png'}")


def correlation_analysis(df):
    """Análisis de correlaciones entre variables."""
    print("\n" + "="*60)
    print("ANÁLISIS DE CORRELACIONES")
    print("="*60)
    
    # Seleccionar variables numéricas relevantes
    corr_cols = [
        'edad', 'imc', 'grado_histologi', 'tamano_tumoral', 
        'infiltracion_mi', 'afectacion_linf', 'infilt_estr_cervix',
        'p53_ihq', 'recep_est_porcent', 'rece_de_Ppor', 'FIGO2023', 'recidiva'
    ]
    
    df_corr = df[corr_cols].dropna()
    corr_matrix = df_corr.corr()
    
    # Correlaciones con recidiva
    print("\n📊 CORRELACIONES CON RECIDIVA:")
    recidiva_corr = corr_matrix['recidiva'].drop('recidiva').sort_values(ascending=False)
    for var, corr in recidiva_corr.items():
        sign = "+" if corr > 0 else ""
        print(f"   {var}: {sign}{corr:.3f}")
    
    # Crear heatmap
    fig, ax = plt.subplots(figsize=(12, 10))
    
    # Rename columns for better display
    rename_map = {
        'edad': 'Edad',
        'imc': 'IMC',
        'grado_histologi': 'Grado',
        'tamano_tumoral': 'Tamaño',
        'infiltracion_mi': 'Infiltr. Mio.',
        'afectacion_linf': 'LVSI',
        'infilt_estr_cervix': 'Infiltr. Cérvix',
        'p53_ihq': 'p53',
        'recep_est_porcent': 'ER%',
        'rece_de_Ppor': 'PR%',
        'FIGO2023': 'FIGO',
        'recidiva': 'Recidiva'
    }
    
    corr_renamed = corr_matrix.rename(index=rename_map, columns=rename_map)
    
    mask = np.triu(np.ones_like(corr_renamed, dtype=bool))
    sns.heatmap(corr_renamed, mask=mask, annot=True, fmt='.2f', cmap='RdBu_r', 
                center=0, vmin=-1, vmax=1, ax=ax, square=True,
                linewidths=0.5, cbar_kws={"shrink": 0.8})
    ax.set_title('Matriz de Correlaciones', fontsize=14, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig(OUTPUT_PATH / 'correlation_matrix.png', dpi=150, bbox_inches='tight')
    plt.close()
    print(f"\n📈 Gráfico guardado: {OUTPUT_PATH / 'correlation_matrix.png'}")


def risk_group_analysis(df):
    """Análisis por grupos de riesgo."""
    print("\n" + "="*60)
    print("ANÁLISIS POR GRUPOS DE RIESGO")
    print("="*60)
    
    riesgo_map = {
        1.0: "Bajo",
        2.0: "Intermedio", 
        3.0: "Intermedio-Alto",
        4.0: "Alto",
        5.0: "Avanzado/Metastásico"
    }
    
    riesgo = df['grupo_de_riesgo_definitivo'].dropna()
    print("\n📊 DISTRIBUCIÓN GRUPOS DE RIESGO:")
    for val, count in riesgo.value_counts().sort_index().items():
        pct = count / len(riesgo) * 100
        print(f"   {riesgo_map.get(val, f'Grupo {int(val)}')}: {count} ({pct:.1f}%)")
    
    # Recidiva por grupo de riesgo
    df_valid = df[df['recidiva'].isin([0, 1])].copy()
    print("\n🎯 TASA DE RECIDIVA POR GRUPO:")
    for grupo in sorted(df_valid['grupo_de_riesgo_definitivo'].dropna().unique()):
        grupo_data = df_valid[df_valid['grupo_de_riesgo_definitivo'] == grupo]
        tasa = grupo_data['recidiva'].mean() * 100
        n = len(grupo_data)
        print(f"   {riesgo_map.get(grupo, f'Grupo {int(grupo)}')}: {tasa:.1f}% (n={n})")
    
    # Crear figura
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    
    # Distribución grupos de riesgo
    ax1 = axes[0]
    riesgo_counts = df['grupo_de_riesgo_definitivo'].map(riesgo_map).value_counts()
    colors = ['#10B981', '#84CC16', '#F59E0B', '#EF4444', '#7C3AED']
    riesgo_counts.plot(kind='bar', ax=ax1, color=colors[:len(riesgo_counts)], edgecolor='white')
    ax1.set_title('Distribución Grupos de Riesgo', fontsize=14, fontweight='bold')
    ax1.set_xlabel('')
    ax1.set_ylabel('Frecuencia')
    ax1.tick_params(axis='x', rotation=45)
    
    # Tasa de recidiva por grupo
    ax2 = axes[1]
    df_valid['grupo_label'] = df_valid['grupo_de_riesgo_definitivo'].map(riesgo_map)
    recidiva_por_grupo = df_valid.groupby('grupo_label')['recidiva'].mean() * 100
    recidiva_por_grupo = recidiva_por_grupo.reindex(['Bajo', 'Intermedio', 'Intermedio-Alto', 'Alto', 'Avanzado/Metastásico'])
    recidiva_por_grupo.dropna().plot(kind='bar', ax=ax2, color=colors[:len(recidiva_por_grupo.dropna())], edgecolor='white')
    ax2.set_title('Tasa de Recidiva por Grupo de Riesgo', fontsize=14, fontweight='bold')
    ax2.set_xlabel('')
    ax2.set_ylabel('Tasa de Recidiva (%)')
    ax2.tick_params(axis='x', rotation=45)
    for i, v in enumerate(recidiva_por_grupo.dropna()):
        ax2.text(i, v + 1, f'{v:.1f}%', ha='center', fontweight='bold')
    
    plt.tight_layout()
    plt.savefig(OUTPUT_PATH / 'risk_group_analysis.png', dpi=150, bbox_inches='tight')
    plt.close()
    print(f"\n📈 Gráfico guardado: {OUTPUT_PATH / 'risk_group_analysis.png'}")


def generate_summary_report(df):
    """Genera un resumen ejecutivo del análisis."""
    print("\n" + "="*60)
    print("RESUMEN EJECUTIVO")
    print("="*60)
    
    df_valid = df[df['recidiva'].isin([0, 1])]
    
    print(f"""
📋 DATASET NSMP ENDOMETRIAL CANCER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Total pacientes: {len(df)}
• Con seguimiento completo: {len(df_valid)}
• Tasa de recidiva: {df_valid['recidiva'].mean()*100:.1f}%
• Mediana seguimiento: {df['diferencia_dias_reci_exit'].median()/365:.1f} años

🎯 FACTORES ASOCIADOS A RECIDIVA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Grado histológico alto
• Mayor tamaño tumoral
• Estadio FIGO avanzado
• LVSI positivo
• Infiltración miometrial profunda

📊 CARACTERÍSTICAS DE LA COHORTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Edad media: {df['edad'].mean():.0f} años
• IMC medio: {df['imc'].mean():.1f} kg/m²
• Estadio I: {((df['FIGO2023'] >= 1) & (df['FIGO2023'] <= 3)).sum()} ({((df['FIGO2023'] >= 1) & (df['FIGO2023'] <= 3)).mean()*100:.0f}%)
• Grado bajo: {(df['grado_histologi'] == 1).sum()} ({(df['grado_histologi'] == 1).mean()*100:.0f}%)
    """)


def main():
    """Ejecuta el análisis exploratorio completo."""
    print("\n" + "🔬"*30)
    print("  NEST - Exploratory Data Analysis")
    print("  Hospital Sant Pau | BitsxlaMarató 2024")
    print("🔬"*30 + "\n")
    
    # Cargar datos
    df = load_data()
    
    # Ejecutar análisis
    basic_info(df)
    target_analysis(df)
    clinical_variables_analysis(df)
    histopathological_analysis(df)
    molecular_analysis(df)
    correlation_analysis(df)
    risk_group_analysis(df)
    generate_summary_report(df)
    
    print("\n" + "="*60)
    print("✅ ANÁLISIS COMPLETADO")
    print(f"📁 Gráficos guardados en: {OUTPUT_PATH}")
    print("="*60 + "\n")
    
    return df


if __name__ == "__main__":
    df = main()
