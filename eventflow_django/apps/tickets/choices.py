"""
Listes de choix partagées pour les informations du "visa" de billet
(apps/tickets/forms.py) — sexe, professions et pays, pensées pour
fonctionner dans n'importe quel pays (voir apps/tickets/models.py::Ticket).
"""

SEXE_CHOICES = [
    ("F", "Femme"),
    ("H", "Homme"),
    ("AUTRE", "Autre / préfère ne pas préciser"),
]

# Catégories socio-professionnelles courantes, utilisables dans la plupart
# des pays francophones et au-delà. "Fonctionnaire d'État" couvre les agents
# de la fonction publique (administration, éducation, santé publique,
# police/armée étant listés séparément vu leur volume).
PROFESSION_CHOICES = [
    ("FONCTIONNAIRE", "Fonctionnaire d'État"),
    ("SALARIE_PRIVE", "Salarié(e) du secteur privé"),
    ("ENTREPRENEUR", "Entrepreneur(se) / Chef(fe) d'entreprise"),
    ("COMMERCANT", "Commerçant(e)"),
    ("PROFESSION_LIBERALE", "Profession libérale (avocat, notaire, consultant…)"),
    ("SANTE", "Professionnel(le) de santé (médecin, infirmier(ère)…)"),
    ("ENSEIGNANT", "Enseignant(e) / Personnel académique"),
    ("INGENIEUR_TECH", "Ingénieur(e) / Technicien(ne)"),
    ("ARTISAN", "Artisan(e)"),
    ("AGRICULTEUR", "Agriculteur(rice) / Éleveur(se)"),
    ("ARTISTE", "Artiste / Créateur(rice)"),
    ("JOURNALISTE", "Journaliste / Communication"),
    ("MILITAIRE_POLICE", "Militaire / Forces de l'ordre"),
    ("ETUDIANT", "Étudiant(e)"),
    ("RETRAITE", "Retraité(e)"),
    ("SANS_EMPLOI", "Sans emploi"),
    ("AUTRE", "Autre"),
]

# Liste des pays reconnus par l'ONU (noms en français), pour un champ
# "pays" qui fonctionne pour n'importe quel acheteur, quel que soit son
# pays d'origine. Le champ "ville" qui l'accompagne reste en texte libre
# (voir ParticipantForm) : il s'adapte ainsi automatiquement à n'importe
# quel pays sans dépendre d'une liste de villes figée.
COUNTRY_CHOICES = [(c, c) for c in [
    "Afghanistan", "Afrique du Sud", "Albanie", "Algérie", "Allemagne",
    "Andorre", "Angola", "Antigua-et-Barbuda", "Arabie saoudite", "Argentine",
    "Arménie", "Australie", "Autriche", "Azerbaïdjan", "Bahamas", "Bahreïn",
    "Bangladesh", "Barbade", "Belgique", "Belize", "Bénin", "Bhoutan",
    "Biélorussie", "Birmanie", "Bolivie", "Bosnie-Herzégovine", "Botswana",
    "Brésil", "Brunei", "Bulgarie", "Burkina Faso", "Burundi", "Cambodge",
    "Cameroun", "Canada", "Cap-Vert", "République centrafricaine", "Chili",
    "Chine", "Chypre", "Colombie", "Comores", "Congo-Brazzaville",
    "Congo-Kinshasa", "Corée du Nord", "Corée du Sud", "Costa Rica",
    "Côte d'Ivoire", "Croatie", "Cuba", "Danemark", "Djibouti", "Dominique",
    "Égypte", "Émirats arabes unis", "Équateur", "Érythrée", "Espagne",
    "Estonie", "Eswatini", "États-Unis", "Éthiopie", "Fidji", "Finlande",
    "France", "Gabon", "Gambie", "Géorgie", "Ghana", "Grèce", "Grenade",
    "Guatemala", "Guinée", "Guinée-Bissau", "Guinée équatoriale", "Guyana",
    "Haïti", "Honduras", "Hongrie", "Îles Marshall", "Îles Salomon", "Inde",
    "Indonésie", "Irak", "Iran", "Irlande", "Islande", "Israël", "Italie",
    "Jamaïque", "Japon", "Jordanie", "Kazakhstan", "Kenya", "Kirghizistan",
    "Kiribati", "Koweït", "Laos", "Lesotho", "Lettonie", "Liban", "Liberia",
    "Libye", "Liechtenstein", "Lituanie", "Luxembourg", "Macédoine du Nord",
    "Madagascar", "Malaisie", "Malawi", "Maldives", "Mali", "Malte", "Maroc",
    "Maurice", "Mauritanie", "Mexique", "Micronésie", "Moldavie", "Monaco",
    "Mongolie", "Monténégro", "Mozambique", "Namibie", "Nauru", "Népal",
    "Nicaragua", "Niger", "Nigeria", "Norvège", "Nouvelle-Zélande", "Oman",
    "Ouganda", "Ouzbékistan", "Pakistan", "Palaos", "Palestine", "Panama",
    "Papouasie-Nouvelle-Guinée", "Paraguay", "Pays-Bas", "Pérou",
    "Philippines", "Pologne", "Portugal", "Qatar", "Roumanie",
    "Royaume-Uni", "Russie", "Rwanda", "Saint-Christophe-et-Niévès",
    "Saint-Marin", "Saint-Vincent-et-les-Grenadines", "Sainte-Lucie",
    "Salvador", "Samoa", "Sao Tomé-et-Principe", "Sénégal", "Serbie",
    "Seychelles", "Sierra Leone", "Singapour", "Slovaquie", "Slovénie",
    "Somalie", "Soudan", "Soudan du Sud", "Sri Lanka", "Suède", "Suisse",
    "Suriname", "Syrie", "Tadjikistan", "Tanzanie", "Tchad", "Tchéquie",
    "Thaïlande", "Timor oriental", "Togo", "Tonga", "Trinité-et-Tobago",
    "Tunisie", "Turkménistan", "Turquie", "Tuvalu", "Ukraine", "Uruguay",
    "Vanuatu", "Vatican", "Venezuela", "Vietnam", "Yémen", "Zambie",
    "Zimbabwe",
]]
