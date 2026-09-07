#!/bin/bash

# EventFlow - Deployment Script
# Script d'installation complète du projet Django EventFlow

set -e  # Exit on error

echo "🚀 EventFlow - Setup Script"
echo "================================"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="eventflow"
PYTHON_VERSION="3.12"
DB_NAME="eventflow_db"
DB_USER="postgres"

# Vérifier Python
echo -e "${YELLOW}[1/10]${NC} Vérification de Python..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 n'est pas installé${NC}"
    exit 1
fi

INSTALLED_PYTHON=$(python3 --version | awk '{print $2}')
echo -e "${GREEN}✓ Python $INSTALLED_PYTHON trouvé${NC}"

# Vérifier PostgreSQL
echo -e "${YELLOW}[2/10]${NC} Vérification de PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL trouvé${NC}"

# Vérifier Redis
echo -e "${YELLOW}[3/10]${NC} Vérification de Redis..."
if ! command -v redis-cli &> /dev/null; then
    echo -e "${YELLOW}⚠ Redis n'est pas installé - required pour Celery${NC}"
fi

# Créer environnement virtuel
echo -e "${YELLOW}[4/10]${NC} Création de l'environnement virtuel..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Environnement virtuel créé${NC}"
else
    echo -e "${GREEN}✓ Environnement virtuel existe déjà${NC}"
fi

# Activer venv
source venv/bin/activate

# Installer les dépendances
echo -e "${YELLOW}[5/10]${NC} Installation des dépendances..."
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
echo -e "${GREEN}✓ Dépendances installées${NC}"

# Configuration .env
echo -e "${YELLOW}[6/10]${NC} Configuration du fichier .env..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    
    # Générer SECRET_KEY
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    sed -i "s/your-secret-key-here/$SECRET_KEY/" .env
    
    # Générer HMAC_SECRET_KEY
    HMAC_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    sed -i "s/your-hmac-secret/$HMAC_KEY/" .env
    
    # Générer ENCRYPTION_KEY (Fernet)
    FERNET_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
    sed -i "s/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=/$FERNET_KEY/" .env
    
    echo -e "${GREEN}✓ Fichier .env créé avec clés générées${NC}"
    echo -e "${YELLOW}⚠ Veuillez vérifier les configurations DATABASE et EMAIL${NC}"
else
    echo -e "${GREEN}✓ Fichier .env existe déjà${NC}"
fi

# Créer la base de données
echo -e "${YELLOW}[7/10]${NC} Création de la base de données PostgreSQL..."
PSQL_COMMAND="psql -U $DB_USER -tc \"SELECT 1 FROM pg_database WHERE datname = '$DB_NAME\""

if ! eval "$PSQL_COMMAND" | grep -q 1; then
    psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
    echo -e "${GREEN}✓ Base de données créée${NC}"
else
    echo -e "${GREEN}✓ Base de données existe déjà${NC}"
fi

# Migrations Django
echo -e "${YELLOW}[8/10]${NC} Exécution des migrations Django..."
python manage.py migrate
echo -e "${GREEN}✓ Migrations appliquées${NC}"

# Collecte des fichiers statiques
echo -e "${YELLOW}[9/10]${NC} Collecte des fichiers statiques..."
python manage.py collectstatic --noinput
echo -e "${GREEN}✓ Fichiers statiques collectés${NC}"

# Créer superuser
echo -e "${YELLOW}[10/10]${NC} Création du superuser..."
python manage.py createsuperuser
echo -e "${GREEN}✓ Superuser créé${NC}"

# Résumé
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ Installation complète!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "📝 Prochaines étapes :"
echo "1. Vérifier les configurations dans .env"
echo "2. Lancer le serveur de développement :"
echo "   python manage.py runserver"
echo ""
echo "3. Dans un autre terminal, lancer Celery :"
echo "   celery -A eventflow_core worker -l info"
echo ""
echo "4. Accéder à l'application :"
echo "   - Public : http://localhost:8000/"
echo "   - Admin : http://localhost:8000/admin/"
echo "   - Scanner : http://localhost:8000/scanner/"
echo ""
echo "📚 Documentation : voir EVENTFLOW_README.md"
echo ""
